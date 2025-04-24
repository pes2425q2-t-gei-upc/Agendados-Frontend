// app/components/FriendsList.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';

import { Friendship } from '@models/Friendship';

import { colors, spacing } from '../../styles/globalStyles';

import ProfileAvatar from './ProfileAvatar';

interface FriendsListProps {
  friends: Friendship[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  onRemoveFriend: (friendshipId: number, friendName: string) => Promise<void>;
  emptyMessage?: string;
}

const FriendsList: React.FC<FriendsListProps> = ({
  friends,
  isLoading,
  isRefreshing,
  onRefresh,
  onRemoveFriend,
  emptyMessage,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  // Navegar a los eventos de un amigo
  const navigateToFriendEvents = (friendId: number, friendName: string) => {
    router.push({
      pathname: '/friends/[id]/events',
      params: { id: friendId, name: friendName },
    });
  };

  // Manejar la eliminación de un amigo
  const handleRemoveFriend = async (friendship: Friendship) => {
    if (!friendship.friend) {
      return;
    }

    const friendName =
      friendship.friend.name ?? friendship.friend.username ?? 'Usuario';

    Alert.alert(
      t('friends.removeFriend'),
      t('friends.confirmRemove', { name: friendName }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            if (processingIds.includes(friendship.id)) {
              return;
            }

            setProcessingIds((prev) => [...prev, friendship.id]);
            try {
              await onRemoveFriend(friendship.id, friendName);
            } finally {
              setProcessingIds((prev) =>
                prev.filter((id) => id !== friendship.id)
              );
            }
          },
        },
      ]
    );
  };

  // Renderizar un amigo en la lista
  const renderFriendItem = ({ item }: { item: Friendship }) => {
    const friendInfo = item.friend;
    if (!friendInfo) {
      return null;
    }

    const friendName = friendInfo.name ?? friendInfo.username ?? 'Usuario';
    const isProcessing = processingIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => navigateToFriendEvents(friendInfo.id, friendName)}
        disabled={isProcessing}
      >
        <ProfileAvatar
          avatar={friendInfo.avatar ?? null}
          savedEventsCount={0}
          size={50}
          showEditButton={false}
        />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friendName}</Text>
          <Text style={styles.friendUsername}>@{friendInfo.username}</Text>
        </View>
        {isProcessing ? (
          <ActivityIndicator size='small' color={colors.primary} />
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRemoveFriend(item)}
          >
            <Ionicons
              name='person-remove-outline'
              size={20}
              color={colors.error}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      renderItem={renderFriendItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={
        friends.length === 0 ? styles.emptyListContainer : null
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name='people-outline' size={60} color={colors.border} />
          <Text style={styles.emptyText}>
            {emptyMessage ?? t('friends.noFriends')}
          </Text>
          <Text style={styles.emptySubtext}>
            {t('friends.addFriendPrompt')}
          </Text>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  friendItem: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 10,
    marginHorizontal: spacing.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  friendName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  friendUsername: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.md,
  },
});

export default memo(FriendsList);
