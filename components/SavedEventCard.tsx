import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { colors, spacing } from '@styles/globalStyles';

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  price: number;
  categories: string[];
  location: string;
}

interface EventCardProps {
  event: Event;
  onDelete?: (id: string) => void;
}

const SavedEventCard = ({ event, onDelete }: EventCardProps) => {
  // Format time range
  const formatTimeRange = () => {
    const options = { hour: '2-digit', minute: '2-digit' };

    // For multi-day events
    if (event.startDate.toDateString() !== event.endDate.toDateString()) {
      return `${event.startDate.toLocaleDateString()} - ${event.endDate.toLocaleDateString()}`;
    }

    // For same-day events
    return `${event.startDate.toLocaleTimeString([], options)} - ${event.endDate.toLocaleTimeString([], options)}`;
  };

  // Handle share event
  const handleShare = async () => {
    try {
      console.log('Sharing event:', event.title);
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
          onPress={() => onDelete && onDelete(event.id)}
        >
          <MaterialIcons name='delete' size={24} color={colors.lightText} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{event.title}</Text>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>${event.price}</Text>
          </View>
        </View>

        <Text style={styles.timeRange}>{formatTimeRange()}</Text>

        <View style={styles.tagsContainer}>
          {event.categories.map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.tagText}>{category}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.locationText}>📍 {event.location}</Text>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <MaterialIcons name='share' size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    elevation: 2,
    marginVertical: spacing.xs,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  categoryTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    marginBottom: 5,
    marginRight: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  deleteActionContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 100,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#C70000',
    borderRadius: 8,
    height: '85%',
    justifyContent: 'center',
    marginVertical: spacing.xs,
    width: 60,
  },
  locationText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 14,
    textAlign: 'left',
  },
  priceTag: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    minWidth: 45,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  priceText: {
    color: colors.darkBackground,
    fontSize: 14,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: spacing.xs,
  },
  tagText: {
    color: colors.darkBackground,
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  timeRange: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
});

export default SavedEventCard;
