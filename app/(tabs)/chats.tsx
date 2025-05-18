import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';

import { Event } from '@models/Event';
import { getEventChats } from '@services/ChatsService';
import { colors, spacing, typography } from '@styles/globalStyles';
import ProtectedRoute from 'app/components/ProtectedRoute';

export default function ChatsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chatEvents, setChatEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  const fetchChatEvents = async () => {
    try {
      setError(null);
      const events = await getEventChats();
      setChatEvents(events);
    } catch (error) {
      setError(t('chats.errorLoadingChats', 'Error loading chats'));
      console.error('Error fetching chat events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChatEvents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChatEvents();
  };

  const navigateToChat = (event: Event) => {
    router.push({
      pathname: '/chat',
      params: {
        eventId: event.id,
        eventTitle: event.title,
      },
    });
  };

  const renderChatItem = ({ item }: { item: Event }) => {
    // Get the first image if available, otherwise use a placeholder
    const imageUrl =
      item.images && item.images.length > 0 ? item.images[0].image_url : null;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigateToChat(item)}
      >
        <View style={styles.avatarContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.avatar}
              resizeMode='cover'
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name='calendar' size={24} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.chatPreview} numberOfLines={1}>
            {formatEventDate(item)}
          </Text>
        </View>
        <Ionicons
          name='chevron-forward'
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  const formatEventDate = (event: Event): string => {
    try {
      if (!event.date_ini) {
        return '';
      }

      const date = new Date(event.date_ini);
      return date.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.loadingText}>
          {t('chats.loading', 'Loading chats...')}
        </Text>
      </View>
    );
  }
  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={typography.title}>{t('navigation.chats', 'Chats')}</Text>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => router.push({ pathname: '/rooms' })}
          >
            <MaterialCommunityIcons
              name='party-popper'
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name='alert-circle' size={40} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchChatEvents}
            >
              <Text style={styles.retryButtonText}>
                {t('common.retry', 'Retry')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {chatEvents.length > 0 ? (
          <FlatList
            data={chatEvents}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name='chatbubbles-outline'
                  size={60}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyText}>
                  {t('chats.noChats', 'No chat conversations yet')}
                </Text>
                <Text style={styles.emptySubText}>
                  {t(
                    'chats.startChatting',
                    'Join event chats to start conversations'
                  )}
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name='chatbubbles-outline'
              size={60}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              {t('chats.noChats', 'No chat conversations yet')}
            </Text>
            <Text style={styles.emptySubText}>
              {t(
                'chats.startChatting',
                'Join event chats to start conversations'
              )}
            </Text>
          </View>
        )}
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  avatar: {
    height: '100%',
    width: '100%',
  },
  avatarContainer: {
    borderRadius: 30,
    height: 60,
    marginRight: spacing.md,
    overflow: 'hidden',
    width: 60,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 30,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatItem: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingVertical: spacing.md,
  },
  chatPreview: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  chatTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: spacing.xl * 2,
  },
  emptySubText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '500',
    marginTop: spacing.md,
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
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.md,
  },
  newChatButton: {
    padding: spacing.xs,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryButtonText: {
    color: colors.lightText,
    fontWeight: 'bold',
  },
});
