/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  Alert,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withTiming,
  useDerivedValue,
  useAnimatedGestureHandler,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import Card from '@components/cardEvent';
import EventDetailModal from '@components/EventDetailModal';
import { Welcome } from '@components/Welcome';
import { useAuth } from '@context/authContext';
import { Event as EventModal } from '@models/Event';
import { getEventRecomendations } from '@services/EventsService';
import { SavedService } from '@services/SavedService';
import WebSocketService, {
  WebSocketServiceState,
} from '@services/WebSocketService';
import { colors } from '@styles/globalStyles';
import { styles } from '@styles/MatchingStyles';
import { useFavorites } from 'app/context/FavoritesContext';

// Import images for swipe indicators
const Like = require('@assets/images/GreenColor.jpeg');
const Dislike = require('@assets/images/RedColor.png');

const SWIPE_VELOCITY = 800;
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
  const votedEvents = useRef<number[]>([]);
  const events = useRef<number[]>([]);

  // Event detail modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Values for animations
  const { width: screenWidth } = useWindowDimensions();
  const hiddenTranslateX = 2 * screenWidth;
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

      if (
        newState.isVotingActive &&
        newState.currentEvent &&
        !events.current.includes(newState.currentEvent.id)
      ) {
        events.current.push(newState.currentEvent.id);
        setShowResults(false);
        console.log('Setting userVotedThisRound to false');
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
        WebSocketService.disconnect(); // Disconnect WebSocket to stop receiving updates
        setResultsCountdown(RESULTS_DISPLAY_SECONDS);
        if (newState.votingResults.match && newState.currentEvent) {
          // MATCH FOUND!
          Alert.alert(
            'Match!',
            `Everyone liked ${newState.currentEvent.title}! Added to favorites.`
          );
          SavedService.addFavorite(newState.currentEvent.id);
          refreshFavorites(); // Refresh favorites list
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

    if (!roomState.isVotingActive && !roomState.currentEvent && roomId) {
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
  }, [roomId, router, refreshFavorites, translateX, progressWidth]);

  // --- Countdown Timers ---
  useEffect(() => {
    if (roomState.isVotingActive && !userVotedThisRound && !showResults) {
      votingTimerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(votingTimerRef.current!); // Explicitly clear

            if (!userVotedThisRound && currentEvent && roomId) {
              WebSocketService.sendVote(false);
              setUserVotedThisRound(true); // Mark as voted (timeout)
              votedEvents.current.push(currentEvent.id);
            }
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
            clearInterval(resultsTimerRef.current!);
            setShowResults(false);
            return 0;
          } else {
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

  // --- Voting Logic ---
  const handleVote = useCallback(
    (isRightSwipe: boolean) => {
      if (
        !currentEvent ||
        !roomId ||
        userVotedThisRound ||
        !roomState.isVotingActive
      ) {
        return;
      }

      votedEvents.current.push(currentEvent.id);
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

  // Derived rotation value based on swipe position
  const rotate = useDerivedValue(
    () => interpolate(translateX.value, [0, hiddenTranslateX], [0, 60]) + 'deg'
  );

  // Animations for the current card
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: rotate.value }],
  }));

  // Progress bar animation
  const progressBarStyle = useAnimatedStyle(() => {
    return { width: `${progressWidth.value}%` };
  });
  // Like/dislike overlay animations
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, hiddenTranslateX / 4], [0, 0.5]),
  }));

  const dislikeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -hiddenTranslateX / 4],
      [0, 0.5]
    ),
  }));

  // Gesture handler for swipe
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

      if (Math.abs(event.velocityX) < SWIPE_VELOCITY) {
        translateX.value = withSpring(0);
        return;
      }

      const isSwipeRight = event.velocityX > 0;
      translateX.value = withTiming(
        isSwipeRight ? hiddenTranslateX : -hiddenTranslateX,
        { duration: 300 },
        () => {
          runOnJS(handleVote)(isSwipeRight);
        }
      );
    },
  });

  // Handle info button click from card component
  const handleInfoButtonPress = useCallback(
    (event: EventModal) => {
      setDetailModalVisible(true);
    },
    [setDetailModalVisible]
  );

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
              WebSocketService.leaveRoom();
            }
            router.replace('/rooms');
          },
        },
      ]
    );
  };

  // Show loading screen

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.pageContainer}>
        {/* Leave Room Button */}
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveRoom}>
          <Ionicons name='close' size={24} color='white' />
        </TouchableOpacity>

        {/* Countdown Timer */}
        <View style={styles.countdownContainer}>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, progressBarStyle]} />
          </View>
          <Text style={styles.timeText}>
            {timeRemaining}s remaining to vote
          </Text>
        </View>

        {/* Results Display */}
        {showResults && roomState.votingResults && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Results</Text>
            <View style={styles.voteCountsContainer}>
              <Text style={styles.voteCountText}>
                Yes: {roomState.votingResults.true_votes}
              </Text>
              <Text style={styles.voteCountText}>
                No: {roomState.votingResults.false_votes}
              </Text>
            </View>
            {roomState.votingResults.match && currentEvent && (
              <Text style={styles.matchText}>
                🎉 Match on {currentEvent.title}! 🎉
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

        {!showResults &&
          currentEvent &&
          !userVotedThisRound &&
          !votedEvents.current.includes(currentEvent.id) && (
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={[styles.animatedCard, cardStyle]}>
                <Animated.Image
                  source={Like}
                  style={[styles.like, { left: 0 }, likeStyle]}
                  resizeMode='stretch'
                />
                <Animated.Image
                  source={Dislike}
                  style={[styles.like, { right: 0 }, dislikeStyle]}
                  resizeMode='stretch'
                />
                <Card
                  event={currentEvent!}
                  onInfoPress={() => handleInfoButtonPress(currentEvent!)}
                />
              </Animated.View>
            </PanGestureHandler>
          )}
        {roomState.isVotingActive &&
          roomState.votingResults &&
          !showResults && (
            <View style={styles.liveVotesContainer}>
              <Text style={styles.liveVotesText}>
                Votes: {roomState.votingResults.true_votes} Yes /{' '}
                {roomState.votingResults.false_votes} No (Total:{' '}
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

        {/* Event detail modal */}
        <EventDetailModal
          visible={detailModalVisible}
          event={currentEvent!}
          onClose={() => {
            setDetailModalVisible(false);
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}
