import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Share, Text, TouchableOpacity, View } from 'react-native';

import { Event } from '@models/Event';
import { styles } from '@styles/EventCard.styles';
import { colors } from '@styles/globalStyles';

import EventDetailModal from './EventDetailModal';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const imageSource =
    event.images && event.images.length > 0
      ? { uri: event.images[0].image_url }
      : require('@assets/images/Icono.png');

  const formatTimeRange = () => {
    const startDate = new Date(event.date_ini);
    const endDate = new Date(event.date_end);
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    if (startDate.toDateString() !== endDate.toDateString()) {
      return `${startDate.toLocaleDateString('es-ES', dateOptions)} - ${endDate.toLocaleDateString('es-ES', dateOptions)}`;
    }
    return `${startDate.toLocaleDateString('es-ES', dateOptions)}`;
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

  const handlePress = () => {
    setShowDetails(true);
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
      <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
        <View style={styles.card}>
          <View style={styles.eventImageContainer}>
            <Image
              source={imageSource}
              style={styles.eventImage}
              progressiveRenderingEnabled={true}
              defaultSource={require('@assets/images/Icono.png')}
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

      <EventDetailModal
        event={event}
        visible={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export default EventCard;
