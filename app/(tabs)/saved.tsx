import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SavedEventCard from '@components/SavedEventCard';
import {
  colors,
  globalStyles,
  typography,
  spacing,
} from '@styles/globalStyles';

// Mock data structure - replace with actual data from your API
const mockEvents = [
  {
    id: '1',
    title: 'Tech Conference',
    startDate: new Date('2023-10-15T10:00:00'),
    endDate: new Date('2023-10-15T16:00:00'),
    price: 50,
    categories: ['Technology', 'Networking'],
    location: 'Convention Center',
  },
  {
    id: '2',
    title: 'Art Exhibition',
    startDate: new Date('2023-10-15T14:00:00'),
    endDate: new Date('2023-10-15T20:00:00'),
    price: 25,
    categories: ['Art', 'Culture'],
    location: 'Downtown Gallery',
  },
  {
    id: '3',
    title: 'Music Festival',
    startDate: new Date('2023-10-16T12:00:00'),
    endDate: new Date('2023-10-18T23:00:00'),
    price: 120,
    categories: ['Music', 'Entertainment'],
    location: 'City Park',
  },
  {
    id: '4',
    title: 'Yoga Workshop',
    startDate: new Date('2023-10-17T08:00:00'),
    endDate: new Date('2023-10-17T10:00:00'),
    price: 15,
    categories: ['Wellness', 'Sport'],
    location: 'Community Center',
  },
];

// Helper function to group events by date
const groupEventsByDate = (events: any) => {
  const grouped: any = {};

  events.forEach((event: any) => {
    const dateKey = event.startDate.toDateString();
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  });

  // Convert to array sorted by date
  return Object.keys(grouped)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((date) => ({
      date,
      events: grouped[date],
    }));
};

// Date Group Component
const DateGroup = ({ group, onDeleteEvent }) => {
  const date = new Date(group.date);
  const today = new Date();

  // Format the date - highlight if today
  const isToday = date.toDateString() === today.toDateString();
  const formattedDate = date.toLocaleDateString('en-US', {
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
        {group.events.map((event) => (
          <SavedEventCard
            key={event.id}
            event={event}
            onDelete={onDeleteEvent}
          />
        ))}
      </View>
    </View>
  );
};

export default function SavedEvents() {
  const router = useRouter();
  const { t } = useTranslation();
  const [events, setEvents] = useState(mockEvents);

  // Group events by date
  const groupedEvents = groupEventsByDate(events);

  // Handle event deletion
  const handleDeleteEvent = (id: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        <Text style={typography.title}>Saved Events</Text>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
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
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
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
    paddingLeft: spacing.md, // This shifts cards to the right
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
