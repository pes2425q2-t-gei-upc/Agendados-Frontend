/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  createRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
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
import { Event as EventModal } from '@models/Event';
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
const VOTING_DELAY_SECONDS = 3; // 3 second delay before voting starts

export default function RoomMatching() {
  const { t } = useTranslation();
  const router = useRouter();
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
  const [matchEvent, setMatchEvent] = useState<EventModal | null>(null);
  const [votingStarted, setVotingStarted] = useState(false);

  // Store voted events to prevent re-voting
  const votedEvents = useRef<number[]>([]);
  const events = useRef<number[]>([]);

  // Event detail modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const infoButtonRef = createRef<any>();

  // Values for animations
  const { width: screenWidth } = useWindowDimensions();
  const hiddenTranslateX = 2 * screenWidth;
  const translateX = useSharedValue(0);
  const progressWidth = useSharedValue(100);

  // Refs for timers
  const votingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- WebSocket State Synchronization ---
  useEffect(() => {
    const handleStateUpdate = async (newState: WebSocketServiceState) => {
      setRoomState(newState);
      if (newState.isConnected) {
        setCurrentEvent(newState.currentEvent);

        if (newState.error) {
          Alert.alert(t('matching.roomError'), newState.error);
          router.replace('/rooms');
        }

        if (
          newState.isVotingActive &&
          newState.currentEvent &&
          newState.currentEvent.id &&
          !votedEvents.current.includes(newState.currentEvent.id) &&
          !events.current.includes(newState.currentEvent.id)
        ) {
          console.log('Setting userVotedThisRound to false');
          events.current.push(newState.currentEvent.id);
          setUserVotedThisRound(false);
          setVotingStarted(false); // Reset voting started flag
          setTimeRemaining(VOTING_TIME_SECONDS + VOTING_DELAY_SECONDS); // Add delay to initial time
          translateX.value = 0; // Reset card position
          progressWidth.value = 100; // Reset progress bar

          // Start delay countdown first
          setTimeout(() => {
            setVotingStarted(true);
            progressWidth.value = withTiming(0, {
              duration: VOTING_TIME_SECONDS * 1000,
              easing: Easing.linear,
            });
          }, VOTING_DELAY_SECONDS * 1000);
        } else if (
          !newState.isVotingActive &&
          !showResults &&
          newState.currentEvent != null
        ) {
          console.log('I have the results');
          console.log('Voting results:', newState.currentEvent);
          setShowResults(true);
          setMatchEvent(newState.currentEvent);
          console.log('Match event:', newState.currentEvent);
          try {
            await SavedService.addFavorite(newState.currentEvent!.id); // Save the matched event
            await refreshFavorites();
          } catch (error) {
            console.error('Error saving matched event:', error);
          }
          setTimeout(() => {
            WebSocketService.disconnect(); // Disconnect WebSocket
            router.replace('/rooms');
          }, 10000);
        }
      }
    };

    const unsubscribe = WebSocketService.subscribe(handleStateUpdate);

    if (!roomState.isVotingActive && !roomState.currentEvent) {
      console.log(
        'RoomMatching: No current event, waiting for server push or host action.'
      );
    }

    return () => {
      unsubscribe();
      if (votingTimerRef.current) {
        clearInterval(votingTimerRef.current);
      }
    };
  }, [
    router,
    refreshFavorites,
    translateX,
    progressWidth,
    roomState.isVotingActive,
    roomState.currentEvent,
    showResults,
    t,
  ]);

  // --- Countdown Timers ---
  useEffect(() => {
    if (roomState.isVotingActive && !userVotedThisRound && !showResults) {
      votingTimerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(votingTimerRef.current!); // Explicitly clear

            if (!userVotedThisRound && currentEvent && votingStarted) {
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
    votingStarted,
  ]);

  // --- Voting Logic ---
  const handleVote = useCallback(
    (isRightSwipe: boolean) => {
      if (
        !currentEvent ||
        userVotedThisRound ||
        !roomState.isVotingActive ||
        !votingStarted
      ) {
        return;
      }

      votedEvents.current.push(currentEvent.id);
      setUserVotedThisRound(true);
      const vote = isRightSwipe;
      WebSocketService.sendVote(vote);
    },
    [
      currentEvent,
      userVotedThisRound,
      roomState.isVotingActive,
      votingStarted,
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
      if (userVotedThisRound || !roomState.isVotingActive || !votingStarted) {
        return;
      }
      context.startX = translateX.value;
    },
    onActive: (event, context: any) => {
      if (userVotedThisRound || !roomState.isVotingActive || !votingStarted) {
        return;
      }
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      if (userVotedThisRound || !roomState.isVotingActive || !votingStarted) {
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
  const handleInfoButtonPress = useCallback(() => {
    setDetailModalVisible(true);
  }, [setDetailModalVisible]);

  // --- UI Rendering ---
  const handleLeaveRoom = () => {
    Alert.alert(t('matching.leaveRoom'), t('matching.leaveRoomConfirmation'), [
      { text: t('matching.cancel'), style: 'cancel' },
      {
        text: t('matching.leave'),
        style: 'destructive',
        onPress: () => {
          WebSocketService.leaveRoom();
          router.replace('/rooms');
        },
      },
    ]);
  };

  // Show loading screen

  if (!currentEvent && !showResults && roomState.isConnected) {
    // Waiting for the first event or for host to start if not started
    return (
      <View style={styles.pageContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.statusText}>
          {t('matching.waitingNextEvent')}{' '}
          {roomState.roomDetails?.isHost ? t('matching.youCanStartRound') : ''}
        </Text>
        <TouchableOpacity
          onPress={handleLeaveRoom}
          style={[styles.button, styles.leaveButton]}
        >
          <Text style={styles.buttonText}>{t('matching.leaveRoomButton')}</Text>
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
        {!showResults && (
          <View style={styles.countdownContainer}>
            <View style={styles.progressBarContainer}>
              <Animated.View style={[styles.progressBar, progressBarStyle]} />
            </View>
            <View
              style={{
                marginTop: 10,
                backgroundColor: 'rgba(128, 128, 128, 0.82)',
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 10,
                alignSelf: 'center',
              }}
            >
              <Text style={styles.timeText}>
                {votingStarted
                  ? t('matching.timeRemainingToVote', { time: timeRemaining })
                  : t('matching.getReadyVotingStarts', {
                      time: timeRemaining - VOTING_TIME_SECONDS,
                    })}
              </Text>
            </View>
          </View>
        )}

        {/* Results Display */}
        {showResults && (
          <View style={styles.resultsContainer}>
            <Text style={styles.matchText}>
              {t('matching.matchOnEvent', { title: matchEvent!.title })}
            </Text>
          </View>
        )}

        {!showResults &&
          currentEvent &&
          !userVotedThisRound &&
          votingStarted &&
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
                  onInfoPress={() => handleInfoButtonPress()}
                  infoButtonRef={infoButtonRef}
                />
              </Animated.View>
            </PanGestureHandler>
          )}
        {roomState.isVotingActive &&
          roomState.votingResults &&
          !showResults && (
            <View style={styles.liveVotesContainer}>
              {!userVotedThisRound && (
                <Text style={styles.liveVotesText}>
                  {t('matching.votes')}{' '}
                  {roomState.votingResults.true_votes +
                    roomState.votingResults.false_votes}
                  {'/'}
                  {roomState.roomDetails?.participants.length ?? 0}
                </Text>
              )}
              {userVotedThisRound && (
                <Text style={styles.votedText}>
                  {t('matching.youHaveVoted')}
                </Text>
              )}
            </View>
          )}

        {/* Fallback if no event and not showing results (e.g., end of events) */}
        {!currentEvent && !showResults && roomState.isConnected && (
          <View style={styles.pageContainer}>
            <Text style={styles.statusText}>{t('matching.noMoreEvents')}</Text>
            <TouchableOpacity
              onPress={handleLeaveRoom}
              style={[styles.button, styles.leaveButton]}
            >
              <Text style={styles.buttonText}>
                {t('matching.leaveRoomButtonFallback')}
              </Text>
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
