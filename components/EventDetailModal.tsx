import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';

import { Event } from '@models/Event';
import { styles } from '@styles/EventDetailModal.styles';
import { colors } from '@styles/globalStyles';

interface EventDetailModalProps {
  event: Event;
  visible: boolean;
  onClose: () => void;
}

const screenHeight = Dimensions.get('window').height;

const EventDetailModal = ({
  event,
  visible,
  onClose,
}: EventDetailModalProps) => {
  const panY = useRef(new Animated.Value(screenHeight)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.timing(panY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, panY]);

  const translateY = panY.interpolate({
    inputRange: [0, screenHeight],
    outputRange: [0, screenHeight],
  });

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: screenHeight,
    duration: 300,
    useNativeDriver: true,
  });

  const handleClose = () => {
    closeAnim.start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          handleClose();
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  // Format date range
  const formatDateRange = () => {
    if (!event.date_ini || !event.date_end) {
      return '';
    }

    const startDate = new Date(event.date_ini);
    const endDate = new Date(event.date_end);

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    // Per a esdeveniments de diversos dies
    if (startDate.toDateString() !== endDate.toDateString()) {
      return (
        <>
          <Text style={styles.dateTimeText}>
            Des de: {startDate.toLocaleDateString('ca-ES', dateOptions)}
          </Text>
          <Text style={styles.dateTimeText}>
            {startDate.toLocaleTimeString('ca-ES', timeOptions)}
          </Text>
          <Text style={styles.dateTimeText}>
            Fins a: {endDate.toLocaleDateString('ca-ES', dateOptions)}
          </Text>
          <Text style={styles.dateTimeText}>
            {endDate.toLocaleTimeString('ca-ES', timeOptions)}
          </Text>
        </>
      );
    }

    // For same-day events
    return (
      <>
        <Text style={styles.dateTimeText}>
          {startDate.toLocaleDateString(undefined, dateOptions)}
        </Text>
        <Text style={styles.dateTimeText}>
          {startDate.toLocaleTimeString(undefined, timeOptions)} -{' '}
          {endDate.toLocaleTimeString(undefined, timeOptions)}
        </Text>
      </>
    );
  };

  // Open map with location
  const openMap = () => {
    if (event.location?.latitude && event.location.longitude) {
      const url = `https://maps.google.com/?q=${event.location.latitude},${event.location.longitude}`;
      Linking.openURL(url);
    } else if (event.location?.address) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(event.location.address)}`;
      Linking.openURL(url);
    }
  };

  // Open external links
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  // Handle image carousel scrolling
  const handleImageScroll = (event: {
    nativeEvent: { contentOffset: { x: any } };
  }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(
      contentOffsetX / Dimensions.get('window').width
    );
    setCurrentImageIndex(currentIndex);
  };

  if (!event) {
    return null;
  }

  return (
    <Modal
      visible={modalVisible}
      animationType='none'
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, flexDirection: 'column-reverse' }}>
        {/* Background overlay */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        />
        {/* Modal content */}
        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY }] }]}
        >
          <View style={styles.dragHandle} {...panResponder.panHandlers}>
            <View style={styles.dragHandleBar} />
          </View>

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with title */}
            <View style={styles.header}>
              <Text style={styles.title}>{event.title}</Text>
            </View>

            {/* Image carousel */}
            {event.images && event.images.length > 0 ? (
              <View style={{ position: 'relative' }}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageCarousel}
                  onScroll={handleImageScroll}
                  scrollEventThrottle={16}
                >
                  {event.images.map((image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image.image_url }}
                      style={styles.eventImage}
                      resizeMode='cover'
                    />
                  ))}
                </ScrollView>

                {/* Carousel position indicator */}
                {event.images.length > 1 && (
                  <View style={styles.carouselDotsContainer}>
                    {event.images.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.carouselIndicatorDot,
                          currentImageIndex === index &&
                            styles.carouselIndicatorActiveDot,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name='image' size={80} color={colors.border} />
              </View>
            )}

            {/* Categories */}
            {event.categories && event.categories.length > 0 && (
              <View style={styles.categoriesContainer}>
                {event.categories.map((category, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{category.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Date and time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name='event' size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Date & Time</Text>
              </View>
              <View style={styles.sectionContent}>{formatDateRange()}</View>
            </View>

            {/* Schedule */}
            {event.schedule && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons
                    name='schedule'
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Schedule</Text>
                </View>
                <Text style={[styles.dateTimeText, { marginTop: 8 }]}>
                  {event.schedule}
                </Text>
              </View>
            )}

            {/* Location */}
            {event.location && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons
                    name='location-on'
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Location</Text>
                </View>
                <View style={styles.sectionContent}>
                  {event.location.space && (
                    <Text style={styles.locationName}>
                      {event.location.space}
                    </Text>
                  )}
                  {event.location.address && (
                    <Text style={styles.locationAddress}>
                      {event.location.address}
                    </Text>
                  )}
                  {event.location.town && (
                    <Text style={styles.locationAddress}>
                      {event.location.town.name}, {event.location.region.name}
                    </Text>
                  )}
                  {(event.location.latitude || event.location.address) && (
                    <TouchableOpacity
                      style={styles.mapButton}
                      onPress={openMap}
                    >
                      <Text style={styles.mapButtonText}>View on map</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Description */}
            {event.description && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons
                    name='description'
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Description</Text>
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.description}>{event.description}</Text>
                </View>
              </View>
            )}

            {/* Ticket Information */}
            {event.info_tickets && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons
                    name='confirmation-number'
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Ticket Information</Text>
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.description}>{event.info_tickets}</Text>
                </View>
              </View>
            )}

            {/* Links */}
            {event.links && event.links.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name='link' size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Related Links</Text>
                </View>
                <View style={styles.sectionContent}>
                  {event.links.map((link, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.linkButton}
                      onPress={() => openLink(link.link)}
                    >
                      <Text
                        style={styles.linkText}
                        numberOfLines={1}
                        ellipsizeMode='tail'
                      >
                        {link.link.replace(/^https?:\/\//, '').split('/')[0]}
                      </Text>
                      <MaterialIcons
                        name='open-in-new'
                        size={16}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Spacer at the bottom */}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Tickets action button */}
          {event.info_tickets && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.buyButton}
                onPress={() =>
                  event.links && event.links.length > 0
                    ? openLink(event.links[0].link)
                    : null
                }
              >
                <Text style={styles.buyButtonText}>More Information</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default EventDetailModal;
