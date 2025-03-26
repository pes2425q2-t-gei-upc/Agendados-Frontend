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
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { Event } from '@models/Event';
import { colors } from '@styles/globalStyles';
import { styles } from '@styles/SavedEventCard.styles';
import { useFavorites } from 'app/context/FavoritesContext';

import EventDetailModal from './EventDetailModal';

interface EventCardProps {
  event: Event;
  onRemoved?: () => void;
}

const SavedEventCard = ({ event, onRemoved }: EventCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  // Usar el contexto de favoritos para manejar la eliminación
  const { removeFavorite } = useFavorites();

  const imageSource =
    event.images && event.images.length > 0
      ? { uri: event.images[0].image_url }
      : require('@assets/images/FotoJazz.jpg');

  const formatTimeRange = () => {
    const startDate = new Date(event.date_ini);
    const endDate = new Date(event.date_end);
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    if (startDate.toDateString() !== endDate.toDateString()) {
      return `${startDate.toLocaleDateString('es-ES', dateOptions)} - ${endDate.toLocaleDateString('es-ES', dateOptions)}`;
    }
    return `${startDate.toLocaleTimeString('es-ES', timeOptions)} - ${endDate.toLocaleTimeString('es-ES', timeOptions)}`;
  };

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

  const handleDelete = async () => {
    if (!event.id) {
      return;
    }

    try {
      const success = await removeFavorite(Number(event.id));
      if (success) {
        // Callback opcional para notificar que este elemento fue eliminado
        if (onRemoved) {
          onRemoved();
        }
      }
    } catch (error) {
      console.error('Error removing event from favorites:', error);
      Alert.alert('Error', 'Could not remove event from favorites');
    } finally {
      swipeableRef.current?.close(); // Reset swipe after delete attempt
    }
  };

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
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <MaterialIcons name='delete' size={24} color={colors.lightText} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
    touchStartY.current = e.nativeEvent.pageY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    const deltaX = Math.abs(e.nativeEvent.pageX - touchStartX.current);
    const deltaY = Math.abs(e.nativeEvent.pageY - touchStartY.current);

    if (deltaX > deltaY && deltaX > 10) {
      isSwiping.current = true;
    }
  };

  const handlePress = () => {
    if (!isSwiping.current) {
      setShowDetails(true);
    }
  };

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
              <Image
                source={imageSource}
                style={styles.eventImage}
                loading='lazy'
                progressiveRenderingEnabled={true}
                defaultSource={require('@assets/images/FotoJazz.jpg')}
              />
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

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name='share' size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>

      {/* Usar la versión actualizada del modal que usa el Context */}
      <EventDetailModal
        event={event}
        visible={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export default SavedEventCard;
