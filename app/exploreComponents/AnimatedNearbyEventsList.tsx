import React, { memo, useRef, useEffect } from 'react';
import { View, FlatList, Animated, Easing, StyleSheet } from 'react-native';

import { Event as EventModel } from '@models/Event';
import { styles as exploreStyles } from '@styles/Explore';

type AnimatedNearbyEventsListProps = {
  events: EventModel[];
  renderEventItem: ({ item }: { item: EventModel }) => React.ReactElement;
  visible: boolean;
  bottomPosition: number;
};

export const AnimatedNearbyEventsList = memo(
  ({
    events,
    renderEventItem,
    visible,
    bottomPosition,
  }: AnimatedNearbyEventsListProps) => {
    const slideAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
    const heightAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: visible ? 1 : 0,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false, // translateY needs false
        }),
        Animated.timing(heightAnim, {
          toValue: visible ? 1 : 0,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false, // maxHeight needs false
        }),
      ]).start();
    }, [visible, slideAnim, heightAnim]);

    const translateY = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [180, 0], // Adjust if needed based on actual height
    });

    const opacity = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const animatedStyle = {
      opacity,
      transform: [{ translateY }],
      maxHeight: heightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 300], // Adjust if needed based on actual height
      }),
      overflow: 'visible' as const,
      position: 'absolute' as const,
      bottom: bottomPosition,
      left: 0,
      right: 0,
    };

    return (
      <Animated.View style={animatedStyle}>
        <View style={carouselStyles.listContainer}>
          <FlatList
            horizontal
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={exploreStyles.nearbyEventsScrollContainer}
          />
        </View>
      </Animated.View>
    );
  }
);

AnimatedNearbyEventsList.displayName = 'AnimatedNearbyEventsList';

// Styles specific to the list container within the animated view
const carouselStyles = StyleSheet.create({
  listContainer: {
    paddingVertical: 10,
    // Add other styles if needed, e.g., background color
  },
});
