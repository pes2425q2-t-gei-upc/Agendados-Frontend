// app/friends/[id]/favorites.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';

import { useFriendship } from '@context/FriendshipContext';
import { Event } from '@models/Event';
import { SavedService } from '@services/SavedService';
import { colors, spacing } from '@styles/globalStyles';

import EventCard from '../../../components/EventCard';
import EventDetailModal from '../../../components/EventDetailModal';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function FriendFavoritesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { friends } = useFriendship();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [friendName, setFriendName] = useState<string>('');

  useEffect(() => {
    if (id) {
      const userId = parseInt(id);
      const friend = friends.find(
        (f) =>
          (f.friend && f.friend.id === userId) ??
          (f.user && f.user.id === userId)
      );

      if (friend) {
        const friendInfo = friend.friend ?? friend.user;
        setFriendName(friendInfo?.name ?? friendInfo?.username ?? 'Usuario');
      }

      loadFriendFavorites(userId);
    }
  }, [id, friends]);

  const loadFriendFavorites = async (userId: number) => {
    try {
      setLoading(true);
      const favorites = await SavedService.getUserFavorites(userId);
      setEvents(favorites);
    } catch (error) {
      console.error('Error loading friend favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (id) {
      setRefreshing(true);
      const userId = parseInt(id);
      await loadFriendFavorites(userId);
      setRefreshing(false);
    }
  };

  const handleCloseModal = () => {
    setDetailModalVisible(false);
    setSelectedEvent(null);
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedEvent(item);
        setDetailModalVisible(true);
      }}
    >
      <EventCard event={item} />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name='arrow-back' size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {t('friends.favoritesOf', { name: friendName })}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name='bookmark-outline' size={60} color={colors.border} />
      <Text style={styles.emptyTitle}>{t('friends.noFavorites')}</Text>
      <Text style={styles.emptyDescription}>
        {t('friends.noFavoritesDescription', { name: friendName })}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle='dark-content'
            backgroundColor={colors.background}
          />
          {renderHeader()}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={colors.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        </SafeAreaView>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle='dark-content'
          backgroundColor={colors.background}
        />
        {renderHeader()}

        <FlatList
          data={events}
          keyExtractor={(item) => item.id?.toString() || ''}
          renderItem={renderEvent}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />

        {selectedEvent && (
          <EventDetailModal
            visible={detailModalVisible}
            event={selectedEvent}
            onClose={handleCloseModal}
          />
        )}
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = {
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
  listContainer: {
    padding: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center' as const,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
  },
};
