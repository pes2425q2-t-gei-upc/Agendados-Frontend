/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  PanResponder,
} from 'react-native';
import { TFunction } from 'i18next';

import EventCard from '@components/EventCard';
import { Event } from '@models/Event'; // Adjust the import path as necessary

interface EventsModalProps {
  visible: boolean;
  toggleEventsModal: () => void;
  filteredMarkers: any[];
  onEventPress?: (eventId: number) => void; // Keep prop definition if it might be used elsewhere
  t: TFunction<"translation", undefined>; // Add t prop
}

export const EventsModal: React.FC<EventsModalProps> = ({
  visible,
  toggleEventsModal,
  filteredMarkers,
  t, // Destructure t prop
}) => {
  const [displayedItems, setDisplayedItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80) {
          closeModal();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setDisplayedItems(filteredMarkers.slice(0, ITEMS_PER_PAGE));
      setPage(1);
      slideAnim.setValue(Dimensions.get('window').height);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, filteredMarkers, slideAnim, backdropOpacity]);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      toggleEventsModal();
    });
  };

  const loadMoreItems = () => {
    if (loading || displayedItems.length >= filteredMarkers.length) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = nextPage * ITEMS_PER_PAGE;
      const newItems = filteredMarkers.slice(startIndex, endIndex);

      setDisplayedItems((prevItems) => [...prevItems, ...newItems]);
      setPage(nextPage);
      setLoading(false);
    }, 300);
  };

  const renderFooter = () => {
    if (!loading) {
      return null;
    }

    return (
      <View style={{ padding: 10, alignItems: 'center' }}>
        <ActivityIndicator size='small' color='#4285F4' />
        <Text style={{ marginTop: 5, color: '#666' }}>
          {t('explore.events.loadingMore')} {/* Use passed t */}
        </Text>
      </View>
    );
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <View style={styles.eventItem}>
      <EventCard event={item} />
    </View>
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType='none'
      transparent
      visible={visible}
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        onTouchStart={closeModal}
      />

      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{t('explore.events.title')}</Text> {/* Use passed t */}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredMarkers.length}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name='close' size={22} color='#fff' />
          </TouchableOpacity>
        </View>

        <FlatList
          data={displayedItems}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMoreItems}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          initialNumToRender={ITEMS_PER_PAGE}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name='calendar-outline' size={60} color='#ccc' />
              <Text style={styles.emptyText}>{t('explore.events.noEventsFound')}</Text> {/* Use passed t */}
            </View>
          }
        />

        <View style={styles.bottomHandle} />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomHandle: {
    alignSelf: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    height: 4,
    marginBottom: Platform.OS === 'ios' ? 30 : 10,
    width: 100,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    bottom: 0,
    height: '85%',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dragHandle: {
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    height: 4,
    width: 60,
  },
  dragHandleContainer: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    paddingTop: 8,
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
  eventItem: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  flatListContent: {
    paddingVertical: 8,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#3b5998',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: '#fff',
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
