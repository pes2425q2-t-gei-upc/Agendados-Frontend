import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
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
} from 'react-native-reanimated';

import Card from '@components/cardEvent';
import EventDetailModal from '@components/EventDetailModal';
import { Event } from '@models/Event';
import {
  getEventRecomendations,
  getEventDetails,
} from '@services/EventsService';
import { SavedService } from '@services/SavedService';
import { colors } from '@styles/globalStyles';
import { styles } from '@styles/mainPageStyles';
import { useFavorites } from 'app/context/FavoritesContext';

// Import images for swipe indicators
const Like = require('@assets/images/GreenColor.jpeg');
const Dislike = require('@assets/images/RedColor.png');

// Define Event type for TinderCard
type TinderCardEvent = {
  name: string;
  image: any;
  place: string;
  cat: string;
  date: string;
  id: number;
};

const SWIPE_VELOCITY = 800;

export default function Main() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalEvents, setOriginalEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<TinderCardEvent[]>([]);
  const detailCache = useRef(new Map());
  const { refreshFavorites } = useFavorites();

  // Card state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  // Event detail modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<Event | null>(
    null
  );

  // Values for animations
  const { width: screenWidth } = useWindowDimensions();
  const hiddenTranslateX = 2 * screenWidth;
  const translateX = useSharedValue(0);

  // Open event detail modal - similar to how it's done in explore.tsx
  const openDetailModal = useCallback(
    async (eventId: number) => {
      try {
        const cachedDetail = detailCache.current.get(eventId.toString());
        if (cachedDetail) {
          setSelectedEventDetail(cachedDetail);
          setDetailModalVisible(true);
          return;
        }

        // Find the original event data (which contains full Event object)
        const originalEvent = originalEvents.find(
          (event) => event.id === eventId
        );

        if (originalEvent) {
          // If we have the full event data in our state already
          setSelectedEventDetail(originalEvent);
          detailCache.current.set(eventId.toString(), originalEvent);
        } else {
          // Fetch from API if not available in state
          const detail = await getEventDetails(eventId);
          detailCache.current.set(eventId.toString(), detail);
          setSelectedEventDetail(detail);
        }

        setDetailModalVisible(true);
      } catch (err) {
        console.error('Error loading event details:', err);
        Alert.alert('Error', 'Could not load event details.');
      }
    },
    [originalEvents]
  );

  // Fetch recommended events from backend
  const fetchRecommendedEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getEventRecomendations();
      setOriginalEvents(data);

      // Transform data to format needed for card component
      const transformedEvents = data.map((event: Event) => {
        const eventDate = new Date(event.date_ini);
        return {
          id: event.id,
          name: event.title,
          image:
            event.images && event.images.length > 0
              ? { uri: event.images[0].image_url }
              : require('@assets/images/FotoJazz.jpg'),
          place: event.location?.town?.name ?? 'Unknown location',
          cat:
            event.categories && event.categories.length > 0
              ? event.categories[0].name
              : 'Events',
          date: eventDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
        };
      });

      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Could not load recommended events');

      // Fallback to static data if API fails
      const fallbackEvents = [
        {
          id: 1,
          name: 'Concierto de Jazz',
          image: require('@assets/images/FotoJazz.jpg'),
          place: 'UPC',
          cat: 'Conciertos',
          date: '22/01/2026',
        },
        {
          id: 2,
          name: 'Festival Arena Sound',
          image: require('@assets/images/FotoConcierto.jpg'),
          place: 'Playa Barceloneta',
          cat: 'Festivales',
          date: '02/12/2028',
        },
        {
          id: 3,
          name: 'Teatro Rey Leon',
          image: require('@assets/images/ReyLeon.jpg'),
          place: 'Sala Apolo',
          cat: 'Teatros',
          date: '26/8/2025',
        },
        {
          id: 4,
          name: 'Museo de Arte Contemporaneo',
          image: require('@assets/images/MuseoContemporaneo.jpg'),
          place: 'Museo Historia de Catalunya',
          cat: 'Museos',
          date: '16/4/2025',
        },
      ];

      setEvents(fallbackEvents);

      // Create fallback original events for compatibility
      const fallbackOriginalEvents = fallbackEvents.map((event) => ({
        id: event.id,
        title: event.name,
        date_ini: new Date(event.date).toISOString(),
        date_end: new Date(event.date).toISOString(),
        categories: [{ id: 1, name: event.cat }],
        images: [],
        links: [],
      }));

      setOriginalEvents(fallbackOriginalEvents as Event[]);
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
        console.log(`Added event ${eventId} to favorites`);
        // Refrescar la lista de favoritos
        await refreshFavorites();
      } catch (err) {
        console.error('Error adding to favorites:', err);
        // Opcional: mostrar un mensaje de error o toast
      }
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
          if (isSwipeRight && events[currentIndex]) {
            // Add to favorites on right swipe
            runOnJS(handleSwipeRight)(events[currentIndex].id);
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
    (eventId: number) => {
      openDetailModal(eventId);
    },
    [openDetailModal]
  );

  // Show loading screen
  if (loading) {
    return (
      <View style={styles.pageContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={{ marginTop: 20, color: colors.text }}>
          Loading recommendations...
        </Text>
      </View>
    );
  }

  // Show error screen
  if (error) {
    return (
      <View style={styles.pageContainer}>
        <Text style={{ color: colors.error, marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity
          style={localStyles.retryButton}
          onPress={fetchRecommendedEvents}
        >
          <Text style={localStyles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No more events to show
  if (currentIndex >= events.length) {
    return (
      <View style={styles.pageContainer}>
        <Text style={{ fontSize: 18, textAlign: 'center', margin: 20 }}>
          No more events to display!
        </Text>
        <TouchableOpacity
          style={localStyles.retryButton}
          onPress={() => {
            setCurrentIndex(0);
            fetchRecommendedEvents();
          }}
        >
          <Text style={localStyles.retryButtonText}>Find more events</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentProfile = events[currentIndex];
  const nextProfile = events[nextIndex];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.pageContainer}>
        {/* Next card (shown behind current) */}
        <View style={styles.nextCardContainer}>
          {nextProfile && (
            <Animated.View style={[styles.animatedCard, nextCardStyle]}>
              <Card
                event1={currentProfile}
                onInfoPress={() => handleInfoButtonPress(currentProfile.id)}
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
              event1={currentProfile}
              onInfoPress={() => handleInfoButtonPress(currentProfile.id)}
            />
          </Animated.View>
        </PanGestureHandler>

        {/* Event Detail Modal */}
        {selectedEventDetail && (
          <EventDetailModal
            event={selectedEventDetail}
            visible={detailModalVisible}
            onClose={() => {
              setDetailModalVisible(false);
              setSelectedEventDetail(null);
            }}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

// Additional local styles
const localStyles = StyleSheet.create({
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
