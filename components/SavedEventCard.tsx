import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { TouchableOpacity, Animated, Alert } from 'react-native'; // Corrected import formatting and removed unused View
import { Swipeable } from 'react-native-gesture-handler';

import { Event } from '@models/Event';
import { colors } from '@styles/globalStyles';
import { styles } from '@styles/SavedEventCard.styles'; // Keep using its own styles for swipe actions
import { useFavorites } from 'app/context/FavoritesContext';

import EventCard from './EventCard'; // Import the new EventCard component

interface SavedEventCardProps {
  event: Event;
  onRemoved?: () => void;
}

const SavedEventCard = ({ event, onRemoved }: SavedEventCardProps) => {
  const swipeableRef = useRef<Swipeable>(null);

  // Usar el contexto de favoritos para manejar la eliminación
  const { removeFavorite } = useFavorites();

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
      outputRange: [100, 0], // Adjust based on the width of the delete button container
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

  return (
    // Swipeable wraps the new EventCard component
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      overshootRight={false} // Prevent overshooting
    >
      {/* Render the reusable EventCard */}
      <EventCard event={event} />
    </Swipeable>
  );
};

export default SavedEventCard;
