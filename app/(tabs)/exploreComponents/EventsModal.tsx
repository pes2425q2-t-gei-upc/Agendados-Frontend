/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import { styles } from '../../../styles/Explore';

import { EventCard, MarkerData } from './EventCard';

interface EventsModalProps {
  visible: boolean;
  toggleEventsModal: () => void;
  filteredMarkers: MarkerData[];
  onEventPress?: (eventId: number) => void;
}

export const EventsModal: React.FC<EventsModalProps> = ({
  visible,
  toggleEventsModal,
  filteredMarkers,
  onEventPress,
}) => {
  const [displayedItems, setDisplayedItems] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Initialize or reset when filteredMarkers changes
  useEffect(() => {
    setDisplayedItems(filteredMarkers.slice(0, ITEMS_PER_PAGE));
    setPage(1);
  }, [filteredMarkers]);

  const loadMoreItems = () => {
    if (loading || displayedItems.length >= filteredMarkers.length) {
      return;
    }

    setLoading(true);

    // Simulate a network request with setTimeout
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = nextPage * ITEMS_PER_PAGE;
      const newItems = filteredMarkers.slice(startIndex, endIndex);

      setDisplayedItems((prevItems) => [...prevItems, ...newItems]);
      setPage(nextPage);
      setLoading(false);
    }, 500);
  };

  const renderFooter = () => {
    if (!loading) {
      return null;
    }

    return (
      <View style={{ padding: 10, alignItems: 'center' }}>
        <ActivityIndicator size='small' color='#4285F4' />
        <Text style={{ marginTop: 5, color: '#666' }}>
          Carregant més esdeveniments...
        </Text>
      </View>
    );
  };

  const handleEventPress = (eventId: number) => {
    if (onEventPress) {
      onEventPress(eventId);
    }
    // Optionally close the modal after selection
    // toggleEventsModal();
  };

  return (
    <Modal
      animationType='slide'
      transparent
      visible={visible}
      onRequestClose={toggleEventsModal}
    >
      <View style={styles.eventsModalContainer}>
        <View style={styles.eventsModalContent}>
          <View style={styles.eventsModalHeader}>
            <Text style={styles.eventsModalTitle}>Esdeveniments</Text>
            <TouchableOpacity onPress={toggleEventsModal}>
              <Ionicons name='close' size={24} color='#333' />
            </TouchableOpacity>
          </View>

          <FlatList
            data={displayedItems}
            renderItem={({ item }) => (
              <EventCard
                key={item.id}
                event={item}
                onPress={() => handleEventPress(item.id)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={loadMoreItems}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            initialNumToRender={ITEMS_PER_PAGE}
          />
        </View>
      </View>
    </Modal>
  );
};
