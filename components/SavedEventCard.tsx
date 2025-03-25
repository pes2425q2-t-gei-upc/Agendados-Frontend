import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Share,
  GestureResponderEvent,
  Image,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { Event } from '@models/Event';
import { colors } from '@styles/globalStyles';
import { styles } from '@styles/SavedEventCard.styles';

import EventDetailModal from './EventDetailModal';

interface EventCardProps {
  event: Event;
  onDelete: (id: number) => void;
}

const SavedEventCard = ({ event, onDelete }: EventCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);
  // Track touch start position to detect horizontal swipes
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  // Get the image source - use the first image from the event if available
  const imageSource =
    event.images && event.images.length > 0
      ? { uri: event.images[0].image_url }
      : require('@assets/images/FotoJazz.jpg'); // Fallback image

  // Format time range
  const formatTimeRange = () => {
    const startDate = new Date(event.date_ini);
    const endDate = new Date(event.date_end);
    const options = { hour: '2-digit', minute: '2-digit' };

    // For multi-day events
    if (startDate.toDateString() !== endDate.toDateString()) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }

    // For same-day events
    return `${startDate.toLocaleTimeString([], options)} - ${endDate.toLocaleTimeString([], options)}`;
  };

  // Handle share event
  const handleShare = async () => {
    try {
      const location = event.location
        ? `${event.location.space ? event.location.space + ', ' : ''}${event.location.town?.name || ''}`
        : 'Location not specified';

      await Share.share({
        title: event.title,
        message: `Check out this event: ${event.title} at ${location}, ${formatTimeRange()}`,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  // Render the delete action when card is swiped left
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });

    return (
      <Animated.View
        style={[styles.deleteActionContainer, { transform: [{ translateX }] }]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(event.id)}
        >
          <MaterialIcons name='delete' size={24} color={colors.lightText} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Handle touch start to record initial position
  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
    touchStartY.current = e.nativeEvent.pageY;
    isSwiping.current = false;
  };

  // Handle touch move to detect horizontal swipes
  const handleTouchMove = (e: GestureResponderEvent) => {
    const deltaX = Math.abs(e.nativeEvent.pageX - touchStartX.current);
    const deltaY = Math.abs(e.nativeEvent.pageY - touchStartY.current);

    // If horizontal movement is greater than vertical and beyond a threshold,
    // mark as swiping to prevent detail modal from opening
    if (deltaX > deltaY && deltaX > 10) {
      isSwiping.current = true;
    }
  };

  // Only open details if not detected as a horizontal swipe
  const handlePress = () => {
    if (!isSwiping.current) {
      setShowDetails(true);
    }
  };

  // Get location text from event.location
  const getLocationText = () => {
    if (!event.location) {
      return 'Location not specified';
    }

    let locationText = '';
    if (event.location.space) {
      locationText += event.location.space;
    }
    if (event.location.town?.name) {
      if (locationText) {
        locationText += ', ';
      }
      locationText += event.location.town.name;
    }
    return locationText || 'Location not specified';
  };

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePress}
          onPressIn={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <View style={styles.card}>
            <View style={styles.eventImageContainer}>
              <Image source={imageSource} style={styles.eventImage} />
            </View>

            <View style={styles.contentContainer}>
              <View>
                <View style={styles.cardHeader}>
                  <Text
                    style={styles.cardTitle}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {event.title}
                  </Text>
                </View>

                <View style={styles.iconTextContainer}>
                  <MaterialIcons
                    name='event'
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={styles.timeRange}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {formatTimeRange()}
                  </Text>
                </View>
                <View style={styles.iconTextContainer}>
                  <MaterialIcons
                    name='location-on'
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={styles.locationText}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {getLocationText()}
                  </Text>
                </View>

                <View style={styles.tagsContainer}>
                  {event.categories && event.categories.length > 0 && (
                    <View style={styles.categoryTag}>
                      <Text
                        style={styles.tagText}
                        numberOfLines={1}
                        ellipsizeMode='tail'
                      >
                        {event.categories[0].name}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>

      <EventDetailModal
        event={event}
        visible={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export default SavedEventCard;
