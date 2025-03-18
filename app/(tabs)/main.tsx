import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  useWindowDimensions,
} from 'react-native';
//import { Pressable } from 'react-native-gesture-handler';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  useAnimatedGestureHandler,
  interpolate,
} from 'react-native-reanimated';

import Card from '@components/cardEvent';

const eventos = [
  {
    name: 'Concierto de Jazz',
    image: require('@assets/images/FotoJazz.jpg'),
    place: 'UPC',
    cat: 'Conciertos',
    date: '22/01/2026',
  },
  {
    name: 'Festival Arena Sound',
    image: require('@assets/images/FotoConcierto.jpg'),
    place: 'Playa Barceloneta',
    cat: 'Festivales',
    date: '02/12/2028',
  },
];

const styles = StyleSheet.create({
  animatedCard: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },

  nextCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },

  pageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

const SWIPE_VELOCITY = 800;

export default function main() {
  const { width: screenWidth } = useWindowDimensions();
  const hiddenTranslateX = 2 * screenWidth;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(currentIndex + 1);

  const currentProfile = eventos[currentIndex];
  const nextProfile = eventos[nextIndex];

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

      translateX.value = withSpring(hiddenTranslateX);
    },
  });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.pageContainer}>
        <View style={styles.nextCardContainer}>
          <Animated.View style={[styles.animatedCard, nextCardStyle]}>
            <Card event1={nextProfile} />
          </Animated.View>
        </View>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.animatedCard, cardStyle]}>
            <Card event1={currentProfile} />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
}
