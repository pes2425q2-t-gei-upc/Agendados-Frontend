import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';

import { styles } from '../../../styles/Explore';

export type MarkerData = {
  fullDate: Date;
  id: number;
  coordinate: { latitude: number; longitude: number };
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  category: string;
  categoryId: number | null;
  location: string;
};
interface EventCardProps {
  event: {
    id: string | number;
    title: string;
    description?: string;
    category?: string;
    location?: string;
    image?: string;
    date?: string;
    time?: string;
    [key: string]: any;
  };
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => (
  <TouchableOpacity style={styles.eventCard} onPress={onPress}>
    <Image
      source={{ uri: event.image }}
      style={styles.eventImage}
      resizeMode='cover'
    />
    <View style={styles.eventCardContent}>
      <Text style={styles.eventCardTitle} numberOfLines={1}>
        {event.title}
      </Text>
      <Text style={styles.eventCardDescription} numberOfLines={1}>
        {event.description}
      </Text>
      <View style={styles.eventCardFooter}>
        <View style={styles.eventCardTime}>
          <Ionicons name='calendar-outline' size={12} color='#666' />
          <Text style={styles.eventCardTimeText}>{event.date}</Text>
        </View>
        <View style={styles.eventCardTime}>
          <Ionicons name='time-outline' size={12} color='#666' />
          <Text style={styles.eventCardTimeText}>{event.time}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
