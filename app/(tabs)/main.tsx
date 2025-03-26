import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Image,
  ActivityIndicator,
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

import Like from '@assets/images/GreenColor.jpeg';
import Dislike from '@assets/images/RedColor.png';
import Card from '@components/cardEvent';
import { styles } from '@styles/mainPageStyles';

import { MarkerData } from '../(tabs)/exploreComponents/EventCard';
import { useEvents } from '../context/eventsContext';
import { getEventRecomendations } from '../Services/EventsService'; // Importa la función de recomendaciones

const SWIPE_VELOCITY = 800;

export default function main() {
  const { width: screenWidth } = useWindowDimensions();
  const hiddenTranslateX = 2 * screenWidth;

  const [events, setEvents] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(currentIndex + 1);

  const currentProfile = events[currentIndex];
  const nextProfile = events[nextIndex];

  const translateX = useSharedValue(0);
  const rotate = useDerivedValue(
    () => interpolate(translateX.value, [0, hiddenTranslateX], [0, 60]) + 'deg'
  ); //From -60, to 0, to 60

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

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      if (Math.abs(event.velocityX) < SWIPE_VELOCITY) {
        translateX.value = withSpring(0);
        return;
      }

      //Depenent de cap a on fas el swipe, que s'envagi pel costat del swipe (- o + hiddenTranslateX)
      translateX.value = withTiming(
        event.velocityX > 0 ? hiddenTranslateX : -hiddenTranslateX,
        {},
        () => runOnJS(setCurrentIndex)(currentIndex + 1)
      );
    },
  });

  useEffect(() => {
    translateX.value = 0;
    setNextIndex(currentIndex + 1);
  }, [currentIndex, translateX]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEventRecomendations();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError("No s'han pogut carregar els esdeveniments recomanats.");
      console.error('Error al cargar eventos recomendados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
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

  // Show loading indicator while events are loading
  if (loading) {
    return (
      <View
        style={[
          styles.pageContainer,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size='large' color='#0000ff' />
      </View>
    );
  }

  // Show error message if there's an error
  if (error || !events.length) {
    return (
      <View
        style={[
          styles.pageContainer,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ fontSize: 18, textAlign: 'center', margin: 20 }}>
          {error || 'No hi ha esdeveniments disponibles'}
        </Text>
        <Pressable
          style={{
            backgroundColor: '#3498db',
            padding: 10,
            borderRadius: 5,
          }}
          onPress={fetchEvents}
        >
          <Text style={{ color: 'white' }}>Tornar a intentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.pageContainer}>
        <View style={styles.nextCardContainer}>
          {nextProfile && (
            <Animated.View style={[styles.animatedCard, nextCardStyle]}>
              <Card event1={nextProfile} />
            </Animated.View>
          )}
        </View>
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
            <Card event1={currentProfile} />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
}
