/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
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
import { Event as EventModal } from '@models/Event';
import { getEventRecomendations } from '@services/EventsService';
import { SavedService } from '@services/SavedService';
import { colors } from '@styles/globalStyles';
import { styles } from '@styles/MatchingStyles';
import { useFavorites } from 'app/context/FavoritesContext';

// Import images for swipe indicators
const Like = require('@assets/images/GreenColor.jpeg');
const Dislike = require('@assets/images/RedColor.png');

const SWIPE_VELOCITY = 800;
const VOTING_TIME = 12; // 12 seconds per vote
const SIMULATED_USERS = 4; // Total users in room including current user

export default function RoomMatching() {
  const [loading, setLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<EventModal | null>(null);
  const { refreshFavorites } = useFavorites();

  // Group voting state
  const [timeRemaining, setTimeRemaining] = useState(VOTING_TIME);
  const [votingActive, setVotingActive] = useState(true);
  const [votesCount, setVotesCount] = useState({
    yes: 0,
    no: 0,
    total: SIMULATED_USERS,
  });
  const [showResults, setShowResults] = useState(false);
  const [userVoted, setUserVoted] = useState(false);
  const [nextCardCountdown, setNextCardCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Event detail modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [, setSelectedEventDetail] = useState<EventModal | null>(null);

  // Values for animations
  const { width: screenWidth } = useWindowDimensions();
  const hiddenTranslateX = 2 * screenWidth;
  const translateX = useSharedValue(0);
  const progressWidth = useSharedValue(100);

  // Start the voting countdown timer
  useEffect(() => {
    if (votingActive && !userVoted) {
      progressWidth.value = withTiming(0, {
        duration: VOTING_TIME * 1000,
        easing: Easing.linear,
      });

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [votingActive, currentIndex, userVoted]);

  // Check if time ran out
  useEffect(() => {
    if (timeRemaining === 0 && votingActive) {
      endVoting();
    }
  }, [timeRemaining, votingActive]);

  // Simulate random votes from other users during the countdown
  useEffect(() => {
    if (votingActive && !showResults) {
      const otherUsers = SIMULATED_USERS - 1;
      const simulatedVotes = {
        yes: userVoted && translateX.value > 0 ? 1 : 0,
        no: userVoted && translateX.value < 0 ? 1 : 0,
      };

      // Simulate other users voting at random intervals
      const simulateVotes = () => {
        const remainingVoters =
          otherUsers - (simulatedVotes.yes + simulatedVotes.no);

        if (remainingVoters > 0) {
          const willVoteYes = Math.random() > 0.4; // 60% chance of voting yes

          if (willVoteYes) {
            simulatedVotes.yes++;
          } else {
            simulatedVotes.no++;
          }

          setVotesCount({
            yes: simulatedVotes.yes,
            no: simulatedVotes.no,
            total: SIMULATED_USERS,
          });

          // Check if everyone has voted
          if (simulatedVotes.yes + simulatedVotes.no >= SIMULATED_USERS) {
            endVoting();
          }
        }
      };

      // Schedule random votes
      const voteIntervals = Array.from({ length: otherUsers }, () =>
        setTimeout(simulateVotes, Math.random() * (VOTING_TIME * 800))
      );

      return () => {
        voteIntervals.forEach((interval) => clearTimeout(interval));
      };
    }
  }, [votingActive, userVoted]);

  // Function to end the voting period and show results
  const endVoting = useCallback(() => {
    setVotingActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setShowResults(true);

    // Schedule the next card after showing results
    resultsTimerRef.current = setInterval(() => {
      setNextCardCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(resultsTimerRef.current!);
          setShowResults(false);
          setUserVoted(false);
          setVotingActive(true);
          setTimeRemaining(VOTING_TIME);
          progressWidth.value = 100;
          setNextCardCountdown(3);
          setVotesCount({ yes: 0, no: 0, total: SIMULATED_USERS });
          setCurrentEvent(null);
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (resultsTimerRef.current) {
        clearInterval(resultsTimerRef.current);
      }
    };
  }, []);

  // Open event detail modal - similar to how it's done in explore.tsx
  const openDetailModal = useCallback(async (event: EventModal) => {
    setSelectedEventDetail(event);
    setDetailModalVisible(true);
  }, []);

  const handleVote = useCallback(
    (isRight: boolean) => {
      setUserVoted(true);

      // Update vote counts based on user's vote
      setVotesCount((prev) => ({
        ...prev,
        yes: isRight ? prev.yes + 1 : prev.yes,
        no: !isRight ? prev.no + 1 : prev.no,
      }));

      // If this is the last vote needed from all users, end voting
      if (votesCount.yes + votesCount.no + 1 >= SIMULATED_USERS) {
        endVoting();
      }
    },
    [votesCount, endVoting]
  );

  // Derived rotation value based on swipe position
  const rotate = useDerivedValue(
    () => interpolate(translateX.value, [0, hiddenTranslateX], [0, 60]) + 'deg'
  );

  // Animations for the current card
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
      {
        rotate: rotate.value,
      },
    ],
  }));

  // Progress bar animation
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  // Gesture handler for swipe
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event) => {
      if (!userVoted) {
        translateX.value = event.translationX;
      }
    },
    onEnd: (event) => {
      if (userVoted) {
        return;
      }

      if (Math.abs(event.velocityX) < SWIPE_VELOCITY) {
        translateX.value = withSpring(0);
        return;
      }

      const isSwipeRight = event.velocityX > 0;
      translateX.value = withTiming(
        isSwipeRight ? hiddenTranslateX : -hiddenTranslateX,
        {},
        () => {
          runOnJS(handleVote)(isSwipeRight);
        }
      );
    },
  });

  // Reset card position when moving to next card
  useEffect(() => {
    translateX.value = 0;
  }, [translateX]);

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

  // Handle info button click from card component
  const handleInfoButtonPress = useCallback(
    (event: EventModal) => {
      openDetailModal(event);
    },
    [openDetailModal]
  );

  // Leave room handler
  const handleLeaveRoom = () => {
    // Clean up timers before navigating
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (resultsTimerRef.current) {
      clearInterval(resultsTimerRef.current);
    }

    // Navigate back
    router.back();
  };

  // Show loading screen
  if (loading) {
    return (
      <View style={styles.pageContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={{ marginTop: 20, color: colors.text }}>
          Loading Event...
        </Text>
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

        {/* Current card with swipe gestures */}
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

        {/* Event detail modal */}
        <EventDetailModal
          visible={detailModalVisible}
          event={currentEvent!}
          onClose={() => {
            setSelectedEventDetail(null);
            setDetailModalVisible(false);
          }}
        />

        {/* Voting Results Modal */}
        <Modal transparent visible={showResults} animationType='fade'>
          <View style={styles.resultsModal}>
            <View style={styles.resultsContainer}>
              {votesCount.yes === SIMULATED_USERS ? (
                <Text style={styles.matchText}>It&apos;s a Match!</Text>
              ) : (
                <>
                  <Text style={styles.resultsTitle}>Voting Results</Text>
                  <Text style={styles.resultsText}>
                    {votesCount.yes}/{votesCount.total} voted yes for this event
                  </Text>
                </>
              )}

              <Animated.View
                style={[
                  styles.countdownCircle,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.countdownNumber}>{nextCardCountdown}</Text>
              </Animated.View>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}
