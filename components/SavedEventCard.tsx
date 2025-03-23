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

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  price: number;
  categories: string[];
  location: string;
  imageUrl?: string; // Add optional image URL property
}

interface EventCardProps {
  event: Event;
  onDelete?: (id: string) => void;
}

const SavedEventCard = ({ event, onDelete }: EventCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);
  // Track touch start position to detect horizontal swipes
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  // Default image if none provided
  const imageSource = event.imageUrl
    ? { uri: event.imageUrl }
    : require('@assets/images/FotoJazz.jpg'); // Create or use an existing placeholder

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
      await Share.share({
        title: event.title,
        message: `Check out this event: ${event.title} at ${event.location}, ${formatTimeRange()}`,
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
          onPress={() => onDelete && onDelete(event.id)}
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

  // Extended event data with mock details
  // In a real app, this would come from your API
  const detailedEvent = {
    ...event,
    description:
      'This is a detailed description of the event. In a real app, this would contain comprehensive information about what attendees can expect, the agenda, speakers, and other relevant details.',
    address: '123 Example Street, City, State, ZIP',
    organizer: 'Example Organization',
    ticketUrl: 'https://example.com/buy-tickets',
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329',
    ],
    latitude: 40.7128,
    longitude: -74.006,
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
                  <Text style={styles.cardTitle}>{event.title}</Text>
                </View>

                <View style={styles.iconTextContainer}>
                  <MaterialIcons
                    name='event'
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.timeRange}>{formatTimeRange()}</Text>
                </View>
                <View style={styles.iconTextContainer}>
                  <MaterialIcons
                    name='location-on'
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.locationText}>{event.location}</Text>
                </View>

                <View style={styles.tagsContainer}>
                  {event.categories.length > 0 && (
                    <View style={styles.categoryTag}>
                      <Text style={styles.tagText}>{event.categories[0]}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>

      <EventDetailModal
        event={{
          id: 5,
          title: 'Visites guiades al Teatre de Tàrraco',
          description:
            "Com pertocava a una ciutat de la seva importància, Tàrraco disposava d’un teatre on s’hi representaven espectacles escènics que, sovint, acompanyaven les principals cerimònies religioses. Si s’observen les restes de la cavea, l’orchestra i la scaena, costa poc d’imaginar-se els romans de Tàrraco gaudint d’aquests espectacles. A la visita comentada coneixereu el Teatre de Tàrraco i el seu entorn, i podreu recórrer la recreació de la càvea, realitzada amb una estructura lineal de ferro que, per una banda evoca la potent graderia que tindria el Teatre en època romana i fa comprensible al visitant l’envergadura del monument, recuperant la geometria original, alhora que dialoga amb les restes. Redescobreix el Teatre de Tàrraco amb una visita guiada on t'endinsaràs també en el dinamisme del seu barri portuari.",
          date_ini: '2025-03-09T00:00:00Z',
          date_end: '2025-03-30T00:00:00Z',
          info_tickets:
            'Gratuït, amb reserva prèvia a https://www.mnat.cat/activitats/',
          schedule: 'Els diumenge 9, 16, 23 i 30 de març A les 11 h',
          categories: [
            {
              id: 3,
              name: 'Rutes I Visites',
            },
          ],
          scopes: [],
          location: {
            id: 5,
            region: {
              id: 3,
              name: 'Tarragones',
            },
            town: {
              id: 3,
              name: 'Tarragona',
            },
            latitude: 41.11286130000001,
            longitude: 1.2493629,
            address: 'C. Sant Magí, 1',
            space: 'Teatre de Tàrraco',
          },
          images: [
            {
              image_url:
                'https://agenda.cultura.gencat.cat/content/dam/agenda/ca/activitats/2025/03/03/011/annexos/Teatre%20de%20t%C3%A0rraco.jpg',
            },
            {
              image_url:
                'https://agenda.cultura.gencat.cat/content/dam/agenda/ca/activitats/2025/03/03/011/annexos/Teatre%20rom%C3%A0%20Tarragona.jpg',
            },
            {
              image_url:
                'https://agenda.cultura.gencat.cat/content/dam/agenda/ca/activitats/2025/03/03/011/annexos/Teatre%20rom%C3%A0.jpg',
            },
          ],
          links: [
            {
              link: 'https://www.mnat.cat/activitats/1297/visita-guiada-al-teatre-de-tarraco/',
            },
            {
              link: 'https://agenda.cultura.gencat.cat/content/agenda/ca.html',
            },
          ],
        }}
        visible={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export default SavedEventCard;
