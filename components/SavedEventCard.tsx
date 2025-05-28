import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { TouchableOpacity, Animated, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { Event } from '@models/Event';
import { colors } from '@styles/globalStyles';
import { styles } from '@styles/SavedEventCard.styles';
import { useFavorites } from 'app/context/FavoritesContext';
import { CalendarService } from 'app/Services/CalendarService';

import EventCard from './EventCard';

interface SavedEventCardProps {
  event: Event;
  onRemoved?: () => void;
}

const SavedEventCard = ({ event, onRemoved }: SavedEventCardProps) => {
  const swipeableRef = useRef<Swipeable>(null);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);

  const { removeFavorite } = useFavorites();

  const handleDelete = async () => {
    if (!event.id) {
      return;
    }

    try {
      const success = await removeFavorite(Number(event.id));
      if (success) {
        if (onRemoved) {
          onRemoved();
        }
      }
    } catch (error) {
      console.error('Error removing event from favorites:', error);
      Alert.alert('Error', 'No se pudo eliminar el evento de favoritos');
    } finally {
      swipeableRef.current?.close();
    }
  };

  const handleSaveToCalendar = async () => {
    if (!event.id) {
      return;
    }

    setIsAddingToCalendar(true);
    try {
      // Use the improved CalendarService method
      await CalendarService.addEventToCalendar(event);
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      Alert.alert('Error', 'No se pudo añadir el evento al calendario');
    } finally {
      setIsAddingToCalendar(false);
      swipeableRef.current?.close();
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

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
    });

    return (
      <Animated.View
        style={[styles.calendarActionButton, { transform: [{ translateX }] }]}
      >
        <TouchableOpacity
          style={[
            styles.calendarButton,
            isAddingToCalendar && styles.disabledButton,
          ]}
          onPress={handleSaveToCalendar}
          disabled={isAddingToCalendar}
        >
          <MaterialIcons
            name={isAddingToCalendar ? 'hourglass-empty' : 'calendar-month'}
            size={24}
            color={colors.lightText}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
    >
      <EventCard event={event} />
    </Swipeable>
  );
};

export default SavedEventCard;
