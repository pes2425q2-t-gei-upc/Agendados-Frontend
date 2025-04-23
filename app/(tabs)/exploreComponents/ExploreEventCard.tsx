import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';

import { Event as EventModel } from '@models/Event';
import { styles } from '@styles/Explore';

interface EventCardProps {
  event: EventModel;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const formatTimeRange = () => {
    const startDate = new Date(event.date_ini);
    const endDate = new Date(event.date_end || event.date_ini);
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
    return `${startDate.toLocaleDateString('es-ES', dateOptions)}    ${startDate.toLocaleTimeString('es-ES', timeOptions)} - ${endDate.toLocaleTimeString('es-ES', timeOptions)}`;
  };

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <Image
        source={
          event.images && event.images.length > 0 && event.images[0]?.image_url
            ? typeof event.images[0].image_url === 'string'
              ? { uri: event.images[0].image_url }
              : event.images[0].image_url
            : require('@assets/images/agendadosbg.png') // Replace with your default image path
        }
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
            <Text style={styles.eventCardTimeText}>{formatTimeRange()}</Text>
          </View>
          {/**
          <View style={styles.eventCardTime}>
            <Ionicons name='time-outline' size={12} color='#666' />
            <Text style={styles.eventCardTimeText}>{event.schedule ?? ''}</Text>
          </View>
          **/}
        </View>
      </View>
    </TouchableOpacity>
  );
}
