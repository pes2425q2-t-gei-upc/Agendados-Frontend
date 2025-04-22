import React, { memo, useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

type CarouselToggleProps = {
  onToggle: () => void;
  isVisible: boolean;
  t: (key: string) => string;
};

export const CarouselToggle = memo(
  ({ onToggle, isVisible}: CarouselToggleProps) => {
    const { t } = useTranslation();
    const rotateAnim = useRef(new Animated.Value(isVisible ? 0 : 1)).current;

    useEffect(() => {
      Animated.timing(rotateAnim, {
        toValue: isVisible ? 0 : 1,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start();
    }, [isVisible, rotateAnim]);

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <TouchableOpacity
        style={carouselStyles.toggleButton}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={carouselStyles.toggleContainer}>
          <Text style={carouselStyles.toggleText}>
            {isVisible
              ? t('explore.events.hideEvents') || 'Ocultar esdeveniments'
              : t('explore.events.nearbyEvents') || 'Esdeveniments Propers'}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="chevron-up" size={24} color="#4285F4" />
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  }
);

CarouselToggle.displayName = 'CarouselToggle';

// Assuming carouselStyles are defined elsewhere or passed as props/context
// If they are specific to this component, define them here:
const carouselStyles = StyleSheet.create({
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '600',
  },
});
