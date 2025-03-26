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
  Image,
} from 'react-native';

interface EventsModalProps {
  visible: boolean;
  toggleEventsModal: () => void;
  filteredMarkers: any[]; // Usando any para simplificar
  onEventPress?: (eventId: number) => void;
}

export const EventsModal: React.FC<EventsModalProps> = ({
  visible,
  toggleEventsModal,
  filteredMarkers,
  onEventPress,
}) => {
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Animation references
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Handle swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Only if dragging downwards
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80) {
          // Threshold to close
          closeModal();
        } else {
          // Reset position if not enough to close
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Animation for opening modal
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

  // Close modal with animation
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

    // Simulate a network request with setTimeout
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
          Carregant més esdeveniments...
        </Text>
      </View>
    );
  };

  const handleEventPress = (eventId: number) => {
    if (onEventPress) {
      onEventPress(eventId);
    }
  };

  // Renderiza cada elemento de evento con la implementación mejorada
  const renderEventItem = ({ item }: { item: (typeof filteredMarkers)[0] }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => handleEventPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.eventCard}>
        <Image
          source={
            typeof item.image === 'string' ? { uri: item.image } : item.image
          }
          style={styles.eventImage}
          resizeMode='cover'
        />
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDateBadgeText}>
            {item.fullDate
              ? new Date(item.fullDate).toLocaleDateString('ca-ES', {
                  day: '2-digit',
                  month: 'short',
                })
              : (item.date ?? 'Sense data')}
          </Text>
        </View>
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View style={styles.eventDateTimeRow}>
            {item.time && (
              <View style={styles.timeContainer}>
                <Ionicons
                  name='time-outline'
                  size={16}
                  color='#666'
                  style={styles.icon}
                />
                <Text style={styles.eventTime}>{item.time}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // If not visible, don't render anything
  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType='none' // We're handling our own animations
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
          <Text style={styles.title}>Esdeveniments</Text>
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
              <Text style={styles.emptyText}>Cap esdeveniment trobat</Text>
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
  categoryBadge: {
    backgroundColor: '#3b5998',
    borderRadius: 4,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventDateBadge: {
    backgroundColor: '#3b5998',
    borderRadius: 4,
    padding: 6,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  eventDateBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventDateTimeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  eventDetails: {
    padding: 12,
  },
  eventImage: {
    height: 180,
    width: '100%',
  },
  eventItem: {
    marginBottom: 8,
  },
  eventTime: {
    color: '#666',
    fontSize: 14,
  },
  eventTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
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
  icon: {
    marginRight: 4,
  },
  locationText: {
    color: '#666',
    fontSize: 14,
  },
  timeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    color: '#fff',
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
