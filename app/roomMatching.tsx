/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useAnimatedGestureHandler,
  runOnJS,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';

import { useAuth } from '@context/authContext';
import { useFavorites } from '@context/FavoritesContext'; // For adding to favorites
import { Event as EventModal } from '@models/Event'; // Assuming EventModal type
import WebSocketService, {
  WebSocketServiceState,
} from '@services/WebSocketService';
import { colors, spacing } from '@styles/globalStyles'; // Assuming global styles

// Import images for swipe indicators
const Like = require('@assets/images/GreenColor.jpeg'); // Adjusted path
const Dislike = require('@assets/images/RedColor.png'); // Adjusted path

const SWIPE_VELOCITY_THRESHOLD = 800;
const VOTING_TIME_SECONDS = 12; // 12 seconds per vote
const RESULTS_DISPLAY_SECONDS = 3; // Time to show results before next card or end

export default function RoomMatching() {
  const router = useRouter();
  const { user } = useAuth();
  const { roomId, roomName } = useLocalSearchParams<{
    roomId: string;
    roomName: string;
  }>();
  const { refreshFavorites } = useFavorites();

  const [roomState, setRoomState] = useState<WebSocketServiceState>(
    WebSocketService.getState()
  );
  const [currentEvent, setCurrentEvent] = useState<EventModal | null>(
    roomState.currentEvent
  );
  const [userVotedThisRound, setUserVotedThisRound] = useState(false);

  // Group voting state - managed by WebSocketService, reflected here
  const [timeRemaining, setTimeRemaining] = useState(VOTING_TIME_SECONDS);
  const [showResults, setShowResults] = useState(false);
  const [resultsCountdown, setResultsCountdown] = useState(
    RESULTS_DISPLAY_SECONDS
  );

  // Event detail modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Animation values
  const { width: screenWidth } = useWindowDimensions();
  const hiddenTranslateX = screenWidth * 1.5;
  const translateX = useSharedValue(0);
  const progressWidth = useSharedValue(100);

  // Refs for timers
  const votingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- WebSocket State Synchronization ---
  useEffect(() => {
    const handleStateUpdate = (newState: WebSocketServiceState) => {
      setRoomState(newState);
      setCurrentEvent(newState.currentEvent);

      if (newState.error) {
        Alert.alert('Room Error', newState.error);
        // Consider navigating away if error is critical
        // router.replace('/rooms');
      }

      if (newState.isVotingActive && newState.currentEvent) {
        // New event or voting started
        setShowResults(false);
        setUserVotedThisRound(false);
        setTimeRemaining(VOTING_TIME_SECONDS);
        translateX.value = 0; // Reset card position
        progressWidth.value = 100; // Reset progress bar
        // Start voting countdown
        progressWidth.value = withTiming(0, {
          duration: VOTING_TIME_SECONDS * 1000,
          easing: Easing.linear,
        });
      } else if (!newState.isVotingActive && newState.votingResults) {
        // Voting ended, show results
        setShowResults(true);
        setResultsCountdown(RESULTS_DISPLAY_SECONDS);
        if (newState.votingResults.match && newState.currentEvent) {
          // MATCH FOUND!
          Alert.alert(
            'Match!',
            `Everyone liked ${newState.currentEvent.name}! Added to favorites.`
          );
          // Add to favorites (implement this function in FavoritesContext or a service)
          // await FavoriteService.addFavorite(user.id, newState.currentEvent.id);
          refreshFavorites(); // Refresh favorites list
          // Server might automatically move to next or end room. Client could also leave.
          // For now, let's assume the server handles the next step or room closure.
          // If client needs to leave:
          // WebSocketService.leaveRoom(roomId!);
          // router.replace('/rooms');
        }
      }

      // If room details are gone, it might mean the room was closed or user was kicked
      if (!newState.roomDetails && roomId) {
        Alert.alert(
          'Room Closed',
          'The room has been closed or you have left.'
        );
        router.replace('/rooms');
      }
    };

    const unsubscribe = WebSocketService.subscribe(handleStateUpdate);

    // Initial check if we should be in matching (e.g. if user reloads into this screen)
    if (!roomState.isVotingActive && !roomState.currentEvent && roomId) {
      // If not actively voting and no event, maybe we need to signal ready or wait
      // This scenario depends on server logic. For now, assume if user is here,
      // they are waiting for an event or the host to start.
      // If WebSocketService doesn't have an event, it implies we are waiting.
      console.log(
        'RoomMatching: No current event, waiting for server push or host action.'
      );
    }

    return () => {
      unsubscribe();
      if (votingTimerRef.current) {
        clearInterval(votingTimerRef.current);
      }
      if (resultsTimerRef.current) {
        clearInterval(resultsTimerRef.current);
      }
    };
  }, [roomId, router, refreshFavorites, translateX, progressWidth]); // Added translateX, progressWidth

  // --- Countdown Timers ---
  useEffect(() => {
    if (roomState.isVotingActive && !userVotedThisRound && !showResults) {
      votingTimerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(votingTimerRef.current!); // Explicitly clear
            // Time's up! WebSocketService should handle this (e.g. auto-vote 'no')
            // Client doesn't need to send a vote here if server handles timeout.
            // If client *must* send a timeout vote:
            // if (!userVotedThisRound && currentEvent && roomId) {
            //   WebSocketService.sendVote(roomId, currentEvent.id.toString(), 'no');
            //   setUserVotedThisRound(true); // Mark as voted (timeout)
            // }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (votingTimerRef.current) {
        clearInterval(votingTimerRef.current);
      }
    }
    return () => {
      if (votingTimerRef.current) {
        clearInterval(votingTimerRef.current);
      }
    };
  }, [
    roomState.isVotingActive,
    userVotedThisRound,
    showResults,
    currentEvent,
    roomId,
  ]);

  useEffect(() => {
    if (showResults) {
      resultsTimerRef.current = setInterval(() => {
        setResultsCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(resultsTimerRef.current!); // Explicitly clear
            setShowResults(false); // Hide results, ready for next event or end
            // Server will send NEW_EVENT or end the session.
            // If it was a match, navigation might have already occurred.
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (resultsTimerRef.current) {
        clearInterval(resultsTimerRef.current);
      }
    }
    return () => {
      if (resultsTimerRef.current) {
        clearInterval(resultsTimerRef.current);
      }
    };
  }, [showResults]);

  // --- Event Detail Modal ---
  const openDetailModal = useCallback((event: EventModal) => {
    // setSelectedEventDetail(event); // Not needed if currentEvent is always the one
    setDetailModalVisible(true);
  }, []);

  // --- Swipe Gesture and Vote Handling ---
  const handleVoteAction = useCallback(
    (isRightSwipe: boolean) => {
      if (
        !currentEvent ||
        !roomId ||
        userVotedThisRound ||
        !roomState.isVotingActive
      ) {
        return;
      }

      setUserVotedThisRound(true);
      const vote = isRightSwipe;
      WebSocketService.sendVote(vote);

      // Stop the timer for this user, server will aggregate and send VOTE_UPDATE or VOTING_ENDED
      if (votingTimerRef.current) {
        clearInterval(votingTimerRef.current);
      }
      progressWidth.value = withTiming(progressWidth.value, { duration: 200 }); // Freeze progress bar
    },
    [
      currentEvent,
      roomId,
      userVotedThisRound,
      roomState.isVotingActive,
      progressWidth,
    ]
  );

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      if (userVotedThisRound || !roomState.isVotingActive) {
        return;
      }
      context.startX = translateX.value;
    },
    onActive: (event, context: any) => {
      if (userVotedThisRound || !roomState.isVotingActive) {
        return;
      }
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      if (userVotedThisRound || !roomState.isVotingActive) {
        return;
      }

      if (Math.abs(event.velocityX) < SWIPE_VELOCITY_THRESHOLD) {
        translateX.value = withSpring(0);
        return;
      }

      const isSwipeRight = event.velocityX > 0;
      translateX.value = withTiming(
        isSwipeRight ? hiddenTranslateX : -hiddenTranslateX,
        { duration: 300 },
        () => {
          runOnJS(handleVoteAction)(isSwipeRight);
        }
      );
    },
  });

  // --- Animated Styles ---
  const rotate = useDerivedValue(
    () => interpolate(translateX.value, [0, hiddenTranslateX], [0, 30]) + 'deg'
  );
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: rotate.value }],
  }));
  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, screenWidth / 4], [0, 1]),
  }));
  const dislikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -screenWidth / 4], [0, 1]),
  }));
  const progressBarAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // --- UI Rendering ---
  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave the matching process?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            if (roomId) {
              WebSocketService.leaveRoom(roomId);
            }
            router.replace('/rooms');
          },
        },
      ]
    );
  };

  if (!roomId || !user) {
    // Should not happen if navigation is set up correctly
    return (
      <View style={styles.pageContainer}>
        <Text style={styles.errorText}>Missing room or user information.</Text>
        <TouchableOpacity
          onPress={() => router.replace('/rooms')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Go to Rooms</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentEvent && !showResults && roomState.isConnected) {
    // Waiting for the first event or for host to start if not started
    return (
      <View style={styles.pageContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.statusText}>
          Waiting for the next event...{' '}
          {roomState.roomDetails?.isHost ? 'You can start the round.' : ''}
        </Text>
        <TouchableOpacity
          onPress={handleLeaveRoom}
          style={[styles.button, styles.leaveButton]}
        >
          <Text style={styles.buttonText}>Leave Room</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!roomState.isConnected) {
    return (
      <View style={styles.pageContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.statusText}>Reconnecting to room...</Text>
        <TouchableOpacity
          onPress={handleLeaveRoom}
          style={[styles.button, styles.leaveButton]}
        >
          <Text style={styles.buttonText}>Leave Room</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.pageContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleLeaveRoom}
            style={styles.leaveIconContainer}
          >
            <Ionicons
              name='close-circle-outline'
              size={30}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.roomName}>{roomName}</Text>
          <View style={{ width: 30 }} />
          {/* Placeholder for balance */}
        </View>

        {/* Voting Progress Bar */}
        {roomState.isVotingActive && !userVotedThisRound && !showResults && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeRemaining}s</Text>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[styles.progressBarForeground, progressBarAnimatedStyle]}
              />
            </View>
          </View>
        )}

        {/* Results Display */}
        {showResults && roomState.votingResults && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Results</Text>
            <View style={styles.voteCountsContainer}>
              <Text style={styles.voteCountText}>
                Yes: {roomState.votingResults.yes}
              </Text>
              <Text style={styles.voteCountText}>
                No: {roomState.votingResults.no}
              </Text>
            </View>
            {roomState.votingResults.match && currentEvent && (
              <Text style={styles.matchText}>
                🎉 Match on {currentEvent.name}! 🎉
              </Text>
            )}
            {!roomState.votingResults.match && (
              <Text style={styles.noMatchText}>No match this round.</Text>
            )}
            <Text style={styles.nextCardText}>
              Next card in {resultsCountdown}s...
            </Text>
          </View>
        )}

        {/* Event Card Stack */}
        {!showResults && currentEvent && (
          <PanGestureHandler
            onGestureEvent={gestureHandler}
            activeOffsetX={[-30, 30]}
          >
            <Animated.View style={styles.cardWrapper}>
              <Animated.View style={[styles.eventCardContainer, cardStyle]}>
                <Animated.Image
                  source={Like}
                  style={[
                    styles.overlayImage,
                    styles.likeOverlay,
                    likeOverlayStyle,
                  ]}
                  resizeMode='contain'
                />
                <Animated.Image
                  source={Dislike}
                  style={[
                    styles.overlayImage,
                    styles.dislikeOverlay,
                    dislikeOverlayStyle,
                  ]}
                  resizeMode='contain'
                />
                {/* Using a simplified card, replace with your actual EventCard component */}
                <View style={styles.cardContent}>
                  <Image
                    source={{
                      uri:
                        currentEvent.image_url ||
                        'https://via.placeholder.com/300',
                    }}
                    style={styles.eventImage}
                  />
                  <Text style={styles.eventName}>{currentEvent.name}</Text>
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {currentEvent.description}
                  </Text>
                  <TouchableOpacity
                    onPress={() => openDetailModal(currentEvent)}
                    style={styles.infoButton}
                  >
                    <Ionicons
                      name='information-circle-outline'
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        )}

        {/* Voting Status / Participants' Votes (Optional UI) */}
        {roomState.isVotingActive &&
          roomState.votingResults &&
          !showResults && (
            <View style={styles.liveVotesContainer}>
              <Text style={styles.liveVotesText}>
                Votes: {roomState.votingResults.yes} Yes /{' '}
                {roomState.votingResults.no} No (Total:{' '}
                {roomState.roomDetails?.participants.length || 0})
              </Text>
              {userVotedThisRound && (
                <Text style={styles.votedText}>You have voted!</Text>
              )}
            </View>
          )}

        {/* Fallback if no event and not showing results (e.g., end of events) */}
        {!currentEvent && !showResults && roomState.isConnected && (
          <View style={styles.pageContainer}>
            <Text style={styles.statusText}>
              No more events in this room, or waiting for host.
            </Text>
            <TouchableOpacity
              onPress={handleLeaveRoom}
              style={[styles.button, styles.leaveButton]}
            >
              <Text style={styles.buttonText}>Leave Room</Text>
            </TouchableOpacity>
          </View>
        )}

        <EventDetailModal
          visible={detailModalVisible}
          event={currentEvent!} // currentEvent should be valid if modal is open
          onClose={() => setDetailModalVisible(false)}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  cardContent: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-start',
    width: '100%',
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Ensure it takes full width for centering card
    marginTop: 120, // Space for header and timer
    marginBottom: 80, // Space for potential bottom controls
  },
  dislikeOverlay: {
    right: '10%',
    transform: [{ rotate: '15deg' }],
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  eventCardContainer: {
    width: '90%',
    aspectRatio: 3 / 4, // Common card aspect ratio
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    // Shadow for card (optional)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative', // For overlay images
  },
  eventDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  eventImage: {
    width: '100%',
    height: '65%', // Adjust as needed
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.border, // Placeholder while image loads
  },
  eventName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: spacing.lg, // For status bar
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.background, // Or transparent if you want content to scroll under
  },
  infoButton: {
    bottom: spacing.xs,
    padding: spacing.xs,
    position: 'absolute',
    right: spacing.xs,
  },
  leaveButton: {
    backgroundColor: colors.error,
  },
  leaveIconContainer: {
    padding: spacing.xs,
  },
  likeOverlay: {
    left: '10%',
    transform: [{ rotate: '-15deg' }],
  },
  liveVotesContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: spacing.xs,
    bottom: 20,
    padding: spacing.sm,
    position: 'absolute',
  },
  liveVotesText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  matchText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success, // Assuming you have a success color
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  nextCardText: {
    color: colors.primary,
    fontSize: 16,
    fontStyle: 'italic',
  },
  noMatchText: {
    color: colors.textSecondary,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  overlayImage: {
    height: 100,
    opacity: 0,
    position: 'absolute',
    top: '30%',
    width: 100, // Controlled by animation
  },
  pageContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  progressBarBackground: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarForeground: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: '100%',
  },
  resultsContainer: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: spacing.md,
    justifyContent: 'center',
    margin: spacing.md,
    padding: spacing.lg,
  },
  resultsTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  roomName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 18,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  timerContainer: {
    position: 'absolute',
    top: 80, // Adjust as needed below header
    width: '90%',
    alignItems: 'center',
    zIndex: 5,
  },
  timerText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  voteCountText: {
    color: colors.text,
    fontSize: 18,
  },
  voteCountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    width: '80%',
  },
  votedText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
