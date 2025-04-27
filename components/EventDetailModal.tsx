/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TFunction } from 'i18next';
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  ActivityIndicator,
} from 'react-native';

import { Event } from '@models/Event';
import { styles } from '@styles/EventDetailModal.styles';
import { colors } from '@styles/globalStyles';
import { useFavorites } from 'app/context/FavoritesContext';

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
  const router = useRouter();
  const panY = useRef(new Animated.Value(screenHeight)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(); // Keep i18n if needed separately
  const locale = 'es'; // Replace with your locale logic

  // Usar el contexto de favoritos
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // Obtener el estado de favorito directamente del contexto
  const eventId = event?.id ? Number(event.id) : 0;
  const isEventFavorite = isFavorite(eventId);

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

  const handleToggleFavorite = async () => {
    if (!event.id) {
      return;
    }

    setIsLoading(true);
    try {
      const eventId = Number(event.id);

      if (isEventFavorite) {
        // Eliminar de favoritos usando el contexto
        await removeFavorite(eventId);
      } else {
        // Añadir a favoritos usando el contexto
        await addFavorite(event);
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    } finally {
      setIsLoading(false);
    }
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
            {t('eventDetails.from')}:{' '}
            {startDate.toLocaleDateString(locale, dateOptions)}
          </Text>
          <Text style={styles.dateTimeText}>
            {startDate.toLocaleTimeString(locale, timeOptions)}
          </Text>
          <Text style={styles.dateTimeText}>
            {t('eventDetails.to')}:{' '}
            {endDate.toLocaleDateString(locale, dateOptions)}
          </Text>
          <Text style={styles.dateTimeText}>
            {endDate.toLocaleTimeString(locale, timeOptions)}
          </Text>
        </>
      );
    }

    // For same-day events
    return (
      <>
        <Text style={styles.dateTimeText}>
          {startDate.toLocaleDateString(locale, dateOptions)}
        </Text>
        <Text style={styles.dateTimeText}>
          {startDate.toLocaleTimeString(locale, timeOptions)} -{' '}
          {endDate.toLocaleTimeString(locale, timeOptions)}
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

  // Custom styles for the favorite button
  const favoriteButtonStyle = {
    position: 'absolute' as const,
    bottom: -22,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  };

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

            {/* Image carousel with favorite button */}
            <View style={{ position: 'relative' }}>
              {event.images && event.images.length > 0 ? (
                <View>
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

              {/* Favorite button */}
              <TouchableOpacity
                style={favoriteButtonStyle}
                onPress={handleToggleFavorite}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size='small' color={colors.primary} />
                ) : (
                  <MaterialIcons
                    name={isEventFavorite ? 'favorite' : 'favorite-border'}
                    size={28}
                    color={isEventFavorite ? colors.error : colors.primary}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={{ marginTop: 15 }}>
              {event.categories && event.categories.length > 0 && (
                <View style={styles.categoriesContainer}>
                  {event.categories.map((category, index) => (
                    <View key={index} style={styles.categoryTag}>
                      <Text style={styles.categoryText}>{category.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Date and time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name='event' size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>
                  {t('eventDetails.dateAndTime')}
                </Text>
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
                  <Text style={styles.sectionTitle}>
                    {t('eventDetails.schedule')}
                  </Text>
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
                  <Text style={styles.sectionTitle}>
                    {t('eventDetails.location')}
                  </Text>
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
                  {(event.location.latitude ?? event.location.address) && (
                    <TouchableOpacity
                      style={styles.mapButton}
                      onPress={openMap}
                    >
                      <Text style={styles.mapButtonText}>
                        {t('eventDetails.viewOnMap')}
                      </Text>
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
                  <Text style={styles.sectionTitle}>
                    {t('eventDetails.description')}
                  </Text>
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.description}>{event.description}</Text>
                </View>
              </View>
            )}

            {/* Chat Button */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name='chat' size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>
                  {t('eventDetails.chat')}
                </Text>
              </View>
              <View style={styles.sectionContent}>
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() =>
                    router.push({
                      pathname: '/chat',
                      params: { eventId: event.id },
                    })
                  }
                >
                  <Text style={styles.chatButtonText}>
                    {t('eventDetails.openChat')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Ticket Information */}
            {event.info_tickets && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons
                    name='confirmation-number'
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>
                    {t('eventDetails.ticketInfo')}
                  </Text>
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
                  <Text style={styles.sectionTitle}>
                    {t('eventDetails.relatedLinks')}
                  </Text>
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
                <Text style={styles.buyButtonText}>
                  {t('eventDetails.moreInfo')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default EventDetailModal;
