// app/friends/[id]/events.tsx
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';

import EventDetailModal from '../../../components/EventDetailModal';
import { colors, spacing } from '../../../styles/globalStyles';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useFriendship } from '../../context/FriendshipContext';
import { Event } from '../../Models/Event';

export default function FriendEventsScreen() {
  const { t } = useTranslation();
  const { id, name } = useLocalSearchParams();
  const { getFriendEvents } = useFriendship();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchEvents = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const friendEvents = await getFriendEvents(Number(id));
      setEvents(friendEvents);
    } catch (err) {
      console.error('Error fetching friend events:', err);
      setError(t('friends.errorFetchingEvents'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setDetailModalVisible(true);
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
      >
        <Image
          source={
            item.images && item.images.length > 0
              ? { uri: item.images[0].image_url }
              : require('@assets/images/FotoJazz.jpg')
          }
          style={styles.eventImage}
        />
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.eventDate}>
            {new Date(item.date_ini).toLocaleDateString()}
          </Text>
          {item.categories && item.categories.length > 0 && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{item.categories[0].name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {name
              ? `${name}${t('friends.apostropheS')} ${t('profile.savedEvents').toLowerCase()}`
              : t('friends.friendEvents')}
          </Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={colors.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.eventRow}
            contentContainerStyle={events.length === 0 ? { flex: 1 } : null}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('friends.noEvents')}</Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        )}

        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            visible={detailModalVisible}
            onClose={() => {
              setDetailModalVisible(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    color: colors.lightText,
    fontSize: 10,
    fontWeight: '500',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    elevation: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: '48%',
  },
  eventDate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  eventDetails: {
    padding: 10,
  },
  eventImage: {
    height: 120,
    width: '100%',
  },
  eventRow: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  header: {
    backgroundColor: colors.backgroundAlt,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: colors.lightText,
    fontSize: 14,
    fontWeight: '500',
  },
});
