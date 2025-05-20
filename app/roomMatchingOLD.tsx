import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import {
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Card from '@components/cardEvent';
import EventDetailModal from '@components/EventDetailModal';
import { mockEvents, mockParticipants } from '@models/MockData';
import { colors, spacing } from '@styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';

const SWIPE_VELOCITY = 800;
const Like = require('@assets/images/GreenColor.jpeg');
const Dislike = require('@assets/images/RedColor.png');

// Mock timer for event swiping
const TIMER_DURATION = 15000; // 15 seconds per event

export default function RoomMatchingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { roomId, name } = useLocalSearchParams();
  const roomName = name || 'Room';
  // States
  const [events, setEvents] = useState<typeof mockEvents>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION / 1000);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Values for animations
  const { width: screenWidth } = useWindowDimensions();
  const hiddenTranslateX = 2 * screenWidth;
  const translateX = useSharedValue(0);

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

  useEffect(() => {
    // Fetch mock events
    setIsLoading(true);
    setTimeout(() => {
      setEvents(mockEvents);
      setIsLoading(false);
      setTimerActive(true);
    }, 1000);
  }, []);

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

  const handleTimerEnd = useCallback(() => {
    setTimerActive(false);

    // Randomly determine if it's a match (75% chance)
    const isMatch = Math.random() < 0.75;

    if (isMatch) {
      setMatchFound(true);
      setTimeout(() => {
        setMatchFound(false);
        goToNextEvent();
      }, 3000);
    } else {
      // No match, go to next card
      goToNextEvent();
    }
  }, []);

  const goToNextEvent = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
    }

    setCurrentEventIndex((prevIndex) => prevIndex + 1);
    setTimerActive(true);
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerActive && events.length > 0) {
      setTimeRemaining(TIMER_DURATION / 1000);

      timer.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timer.current) {
              clearInterval(timer.current);
            }
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timer.current) {
          clearInterval(timer.current);
        }
      };
    }
  }, [timerActive, events, currentEventIndex, handleTimerEnd]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      if (Math.abs(event.velocityX) < SWIPE_VELOCITY) {
        translateX.value = withSpring(0);
        return;
      }

      const isSwipeRight = event.velocityX > 0;
      translateX.value = withTiming(
        isSwipeRight ? hiddenTranslateX : -hiddenTranslateX,
        {},
        () => {
          if (isSwipeRight) {
            //!Notify the like to the WEBSOCKET
            //runOnJS(handleSwipeRight)(currentEventId.value);
          } else {
            //!Notify the dislike to the WEBSOCKET
            //runOnJS(handleSwipeLeft)(currentEventId.value);
          }
        }
      );
    },
  });

  const showEventDetails = useCallback(() => {
    setDetailModalVisible(true);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Alert.alert(
                  'Leave Matching',
                  'Are you sure you want to leave the matching session?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Leave', onPress: () => router.back() },
                  ]
                );
              }}
            >
              <Ionicons name='arrow-back' size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{roomName}</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.participantsContainer}>
            <View style={styles.participantsRow}>
              {mockParticipants.map((participant) => (
                <View key={participant.id} style={styles.participantContainer}>
                  <Image
                    source={{ uri: participant.avatar }}
                    style={styles.avatar}
                  />
                </View>
              ))}
            </View>
            <Text style={styles.participantsCount}>
              {mockParticipants.length}/7 participants
            </Text>
          </View>
          <View style={styles.timerContainer}>
            <View style={styles.timer}>
              <View
                style={[
                  styles.timerProgress,
                  {
                    width: `${(timeRemaining / (TIMER_DURATION / 1000)) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.timerText}>{timeRemaining}s</Text>
          </View>
          <View style={styles.cardContainer}>
            {events.length > currentEventIndex && (
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
                    event={events[currentEventIndex]}
                    onInfoPress={showEventDetails}
                  />
                </Animated.View>
              </PanGestureHandler>
            )}

            {events.length <= currentEventIndex && (
              <View style={[styles.card, styles.noMoreCards]}>
                <Text style={styles.noMoreCardsText}>No more events</Text>
                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.returnButtonText}>Return to Room</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <EventDetailModal
            event={events[currentEventIndex]}
            visible={detailModalVisible}
            onClose={() => setDetailModalVisible(false)}
          />
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  animatedCard: {
    alignItems: 'center',
    flex: 1,
    height: '70%',
    justifyContent: 'center',
    width: '95%',
  },
  avatar: {
    borderColor: colors.background,
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    width: 40,
  },
  backButton: {
    padding: spacing.xs,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    elevation: 5,
    height: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: '100%',
  },
  cardContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  container: {
    backgroundColor: 'transparent',
    backgroundImage: 'url("@assets/images/FondoXat1.jpg")',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  like: {
    elevation: 1,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    zIndex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.md,
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  noMoreCardsText: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  participantContainer: {
    marginHorizontal: -5,
  },
  participantsContainer: {
    alignItems: 'center',
    padding: spacing.md,
  },
  participantsCount: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  participantsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  returnButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  returnButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  timer: {
    backgroundColor: colors.border,
    borderRadius: 3,
    flex: 1,
    height: 6,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  timerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  timerProgress: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  timerText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'right',
    width: 40,
  },
});
