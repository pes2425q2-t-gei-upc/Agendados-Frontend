import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';

import { styles } from '../../../styles/Explore';

import { EventCard, MarkerData } from './EventCard';

interface EventsModalProps {
  visible: boolean;
  toggleEventsModal: () => void;
  filteredMarkers: MarkerData[];
}

export const EventsModal: React.FC<EventsModalProps> = ({
  visible,
  toggleEventsModal,
  filteredMarkers,
}) => {
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
          <ScrollView>
            {filteredMarkers.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => {
                  /* Navegación al detalle del evento */
                }}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
