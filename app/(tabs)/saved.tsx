import { useRouter } from 'expo-router';
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SavedEventCard from '@components/SavedEventCard';
import { Event } from '@models/Event';
import { SavedService } from '@services/SavedService';
import {
  colors,
  globalStyles,
  typography,
  spacing,
} from '@styles/globalStyles';

// Helper function to group events by date - moved outside component to avoid unnecessary recreation
const groupEventsByDate = (events: Event[]) => {
  const grouped: Record<string, Event[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of today

  // Helper function to get all dates between start and end (inclusive), only from today onwards
  const getDatesInRange = (startDate: Date, endDate: Date) => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    // Use the date only, without time
    currentDate.setHours(0, 0, 0, 0);
    const endDateOnly = new Date(endDate);
    endDateOnly.setHours(0, 0, 0, 0);

    // If end date is in the past, return empty array
    if (endDateOnly < today) {
      return dates;
    }

    // If start date is in the past, set it to today
    if (currentDate < today) {
      currentDate = new Date(today);
    }

    // Loop through all days between start (or today) and end
    while (currentDate <= endDateOnly) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // First filter events that might have dates from today onwards
  const relevantEvents = events.filter((event) => {
    const endDate = event.date_end
      ? new Date(event.date_end)
      : new Date(event.date_ini);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  });

  relevantEvents.forEach((event: Event) => {
    const startDate = new Date(event.date_ini);
    const endDate = event.date_end
      ? new Date(event.date_end)
      : new Date(event.date_ini);

    // Get all dates this event spans from today onwards
    const eventDates = getDatesInRange(startDate, endDate);

    // Add the event to each day it spans
    eventDates.forEach((date) => {
      const dateKey = date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      // Avoid duplicates (just in case)
      if (!grouped[dateKey].find((e) => e.id === event.id)) {
        grouped[dateKey].push(event);
      }
    });
  });

  // Convert to array sorted by date
  return Object.keys(grouped)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Changed from b-a to a-b for ascending order
    .map((date) => ({
      date,
      events: grouped[date],
    }));
};

// Date Group Component - optimization with React.memo
// Date Group Component - optimization with React.memo
interface DateGroupProps {
  group: { date: string; events: Event[] };
  onDeleteEvent: (id: number) => void;
}

const DateGroup = memo(({ group, onDeleteEvent }: DateGroupProps) => {
  const date = new Date(group.date);
  const today = new Date();

  // Format the date - highlight if today
  const isToday = date.toDateString() === today.toDateString();
  const formattedDate = date.toLocaleDateString('ca-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.dateGroup}>
      <Text style={[styles.dateText, isToday && styles.todayText]}>
        {isToday ? `Today - ${formattedDate}` : formattedDate}
      </Text>

      <View style={styles.eventsContainer}>
        {group.events.map((event: Event) => (
          <SavedEventCard
            key={event.id}
            event={event}
            onDelete={onDeleteEvent}
          />
        ))}
      </View>
    </View>
  );
});

// Add display name for better debugging
DateGroup.displayName = 'DateGroup';

export default function SavedEvents() {
  const router = useRouter();
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const loadSavedEvents = async () => {
    setLoading(true);
    try {
      const savedEvents = await SavedService.getFavorites();
      // Make sure we have an array of events, even if the service returns void
      setEvents(Array.isArray(savedEvents) ? savedEvents : []);
    } catch (error) {
      console.error('Error loading saved events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize grouped events to prevent recalculation on every render
  const groupedEvents = useMemo(() => {
    return groupEventsByDate(events);
  }, [events]);

  // Optimize deletion handler with useCallback
  const handleDeleteEvent = useCallback(async (id: number) => {
    try {
      // Mark this ID as being deleted
      setDeletingIds((prev) => new Set(prev).add(id));

      // Update the UI immediately for better responsiveness
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));

      // Make the API call in the background
      await SavedService.removeFavorite(id);
    } catch (error) {
      console.error('Error removing event:', error);
    } finally {
      // Remove from deleting set when done
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, []);

  // The rest of the component remains the same
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        <Text style={typography.title}>Saved Events</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true} // Performance boost for long lists
            initialNumToRender={10} // Only render what's visible initially
          >
            {groupedEvents.map((group, index) => (
              <DateGroup
                key={index}
                group={group}
                onDeleteEvent={handleDeleteEvent}
              />
            ))}

            {groupedEvents.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No saved events</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  dateGroup: {
    marginBottom: 30,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  eventsContainer: {
    paddingLeft: 10, // This shifts cards to the right
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  todayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
