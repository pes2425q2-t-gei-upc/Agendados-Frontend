/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
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
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '@components/cardEvent';
import EventDetailModal from '@components/EventDetailModal';
import { Welcome } from '@components/Welcome';
import { Event as EventModal } from '@models/Event';
import { getEventRecomendations } from '@services/EventsService';
import { SavedService } from '@services/SavedService';
import { colors } from '@styles/globalStyles';
import { styles } from '@styles/mainPageStyles';
import { useFavorites } from 'app/context/FavoritesContext';

// Import images for swipe indicators
const Like = require('@assets/images/GreenColor.jpeg');
const Dislike = require('@assets/images/RedColor.png');

const SWIPE_VELOCITY = 800;

export default function Main() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventModal[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const { refreshFavorites } = useFavorites();

  // Card state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  // Store current event ID for UI thread
  const currentEventId = useSharedValue<number | null>(null);

  // Event detail modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [, setSelectedEventDetail] = useState<EventModal | null>(null);

  // Values for animations
  const { width: screenWidth } = useWindowDimensions();
  const hiddenTranslateX = 2 * screenWidth;
  const translateX = useSharedValue(0);

  // Get current event from index (defined early to avoid reference error)
  const currentEvent = events[currentIndex];
  // Get next event from index
  const nextEvent = events[nextIndex];

  // Update current event ID when currentIndex or events change
  useEffect(() => {
    if (events[currentIndex]) {
      currentEventId.value = events[currentIndex].id;
    } else {
      currentEventId.value = null;
    }
  }, [currentIndex, events]);

  // Open event detail modal - similar to how it's done in explore.tsx
  const openDetailModal = useCallback(async (event: EventModal) => {
    setSelectedEventDetail(event);
    setDetailModalVisible(true);
  }, []);

  // Fetch recommended events from backend
  const fetchRecommendedEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data: EventModal[] = await getEventRecomendations();
      setEvents(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendedEvents();
  }, [fetchRecommendedEvents]);

  // Handle adding event to favorites when swiping right
  const handleSwipeRight = useCallback(
    async (eventId: number) => {
      try {
        await SavedService.addFavorite(eventId);
        // Refrescar la lista de favoritos
        await refreshFavorites();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {}
    },
    [refreshFavorites]
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

  // Animations for the next card
  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-hiddenTranslateX, 0, hiddenTranslateX],
          [1, 0.8, 1]
        ),
      },
    ],
    opacity: interpolate(
      translateX.value,
      [-hiddenTranslateX, 0, hiddenTranslateX],
      [1, 0.6, 1]
    ),
  }));

  // Gesture handler for swipe
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
          if (isSwipeRight && currentEventId.value !== null) {
            // Add to favorites on right swipe
            runOnJS(handleSwipeRight)(currentEventId.value);
          }
          // Move to next card
          runOnJS(setCurrentIndex)(currentIndex + 1);
        }
      );
    },
  });

  // Reset card position when moving to next card
  useEffect(() => {
    translateX.value = 0;
    setNextIndex(currentIndex + 1);
  }, [currentIndex, translateX]);

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

  useEffect(() => {
    const checkWelcome = async () => {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    };
    checkWelcome();
  }, []);

  // Show loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.pageContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={{ marginTop: 20, color: colors.text }}>
          Loading recommendations...
        </Text>
      </SafeAreaView>
    );
  }

  // Show error screen
  if (error) {
    return (
      <SafeAreaView style={styles.pageContainer}>
        <Text style={{ color: colors.error, marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchRecommendedEvents}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // No more events to show
  if (currentIndex >= events.length) {
    return (
      <SafeAreaView style={styles.pageContainer}>
        <Text style={{ fontSize: 18, textAlign: 'center', margin: 20 }}>
          No more events to display!
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setCurrentIndex(0);
            fetchRecommendedEvents();
          }}
        >
          <Text style={styles.retryButtonText}>Find more events</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.pageContainer}>
        {/* Next card (shown behind current) */}
        <View style={styles.nextCardContainer}>
          {nextEvent && (
            <Animated.View style={[styles.animatedCard, nextCardStyle]}>
              <Card
                event={nextEvent}
                onInfoPress={() => handleInfoButtonPress(nextEvent)}
              />
            </Animated.View>
          )}
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
              event={currentEvent}
              onInfoPress={() => handleInfoButtonPress(currentEvent)}
            />
          </Animated.View>
        </PanGestureHandler>
        {/* Event detail modal */}
        <EventDetailModal
          visible={detailModalVisible}
          event={currentEvent}
          onClose={() => {
            setSelectedEventDetail(null);
            setDetailModalVisible(false);
          }}
        />
      </View>
      <Welcome
        visible={showWelcome}
        onClose={async () => {
          setShowWelcome(false);
          await AsyncStorage.setItem('hasSeenWelcome', 'true');
        }}
      />
    </GestureHandlerRootView>
  );
}
