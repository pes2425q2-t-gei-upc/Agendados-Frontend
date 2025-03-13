import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
//import { Pressable } from 'react-native-gesture-handler';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';

import Card from '@components/cardEvent';

const e1 = {
  name: 'Concierto de Jazz',
  image: require('@assets/images/FotoJazz.jpg'),
  place: 'UPC',
  cat: 'Conciertos',
  date: '22/01/2026',
};

const e2 = {
  name: 'Festival Arena Sound',
  image: require('@assets/images/FotoConcierto.jpg'),
  place: 'Playa Barceloneta',
  cat: 'Festivales',
  date: '02/12/2028',
};

const styles = StyleSheet.create({
  animatedCard: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },

  pageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default function main() {
  const translateX = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],
  }));

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: () => {
      console.warn('Touch ended');
    },
  });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.pageContainer}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.animatedCard, cardStyle]}>
            <Card event1={e2} />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
}
