// app/components/FriendsList.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { colors, spacing } from '../../styles/globalStyles';
import { Friendship } from '../Models/Friendship';

import ProfileAvatar from './ProfileAvatar';

interface FriendsListProps {
  friends: Friendship[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRemoveFriend: (friendshipId: number) => void;
  emptyMessage: string;
}

const FriendsList: React.FC<FriendsListProps> = ({
  friends,
  isLoading,
  isRefreshing,
  onRefresh,
  onRemoveFriend,
  emptyMessage,
}) => {
  // Renderizar un item de amigo
  const renderFriendItem = ({ item }: { item: Friendship }) => {
    // Verificamos si tenemos datos válidos para mostrar
    if (!item.friend && !item.user) {
      return null;
    }

    // Determinamos qué información mostrar - podría ser friend o user
    // dependiendo de quién inició la amistad
    const friendInfo = item.friend ?? item.user;

    if (!friendInfo) {
      return null;
    }

    const friendName = friendInfo.name ?? friendInfo.username ?? 'Usuario';

    return (
      <View style={styles.friendItem}>
        <ProfileAvatar
          avatar={friendInfo.avatar ?? null}
          savedEventsCount={0}
          size={40}
          showEditButton={false}
        />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friendName}</Text>
          <Text style={styles.friendUsername}>@{friendInfo.username}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemoveFriend(item.id)}
        >
          <Ionicons
            name='close-circle-outline'
            size={24}
            color={colors.error}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      renderItem={renderFriendItem}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name='people-outline' size={60} color={colors.border} />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 60,
    padding: spacing.xl,
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
    margin: spacing.xs,
    padding: 12,
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
  },
  removeButton: {
    padding: 6,
  },
});

export default FriendsList;
