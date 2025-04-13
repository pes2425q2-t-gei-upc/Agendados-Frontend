/* eslint-disable react-native/sort-styles */
// app/friends/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { colors, spacing } from '../../styles/globalStyles';
import ProfileAvatar from '../components/ProfileAvatar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useFriendship } from '../context/FriendshipContext';
import { User } from '../Models/User';

export default function FriendsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    friends,
    pendingRequests,
    loadingFriends,
    errorMessage,
    searchUsers,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refreshFriends,
  } = useFriendship();

  const [showingRequests, setShowingRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert(t('common.error'), t('friends.searchError'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      const success = await acceptFriendRequest(friendshipId);
      if (success) {
        Alert.alert(t('common.success'), t('friends.friendAccepted'));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert(t('common.error'), String(error));
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    try {
      const success = await rejectFriendRequest(friendshipId);
      if (success) {
        Alert.alert(t('common.success'), t('friends.friendRejected'));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert(t('common.error'), String(error));
    }
  };

  const handleRemoveFriend = async (
    friendshipId: number,
    friendName: string
  ) => {
    Alert.alert(
      t('common.confirm'),
      t('friends.confirmRemove', { name: friendName }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              const success = await removeFriend(friendshipId);
              if (success) {
                Alert.alert(t('common.success'), t('friends.friendRemoved'));
              }
            } catch (error) {
              console.error('Error removing friend:', error);
              Alert.alert(t('common.error'), String(error));
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshFriends();
    setRefreshing(false);
  };

  const navigateToAddFriend = () => {
    router.push('/friends/add');
  };

  const navigateToFriendEvents = (friendId: number, friendName: string) => {
    router.push({
      pathname: '/friends/[id]/events',
      params: { id: friendId, name: friendName },
    });
  };

  const renderFriendItem = ({
    item,
  }: {
    item: { id: number; friend: User | undefined };
  }) => {
    const friendInfo = item.friend;
    const friendName = friendInfo?.name ?? friendInfo?.username ?? 'Usuario';

    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => navigateToFriendEvents(friendInfo.id, friendName)}
      >
        <ProfileAvatar
          avatar={friendInfo?.avatar ?? null}
          savedEventsCount={0} // No tenemos este dato aquí, podríamos obtenerlo
          size={50}
          showEditButton={false}
        />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friendName}</Text>
          <Text style={styles.friendUsername}>@{friendInfo?.username}</Text>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemoveFriend(item.id, friendName)}
        >
          <Ionicons
            name='person-remove-outline'
            size={20}
            color={colors.error}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderRequestItem = ({
    item,
  }: {
    item: { id: number; friend: User | undefined };
  }) => {
    const friendInfo = item.friend;
    const friendName = friendInfo?.name ?? friendInfo?.username ?? 'Usuario';

    return (
      <View style={styles.requestItem}>
        <ProfileAvatar
          avatar={friendInfo?.avatar ?? null}
          savedEventsCount={0}
          size={40}
          showEditButton={false}
        />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friendName}</Text>
          <Text style={styles.friendUsername}>@{friendInfo?.username}</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.requestButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(item.id)}
          >
            <Text style={styles.requestButtonText}>{t('friends.accept')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.requestButton, styles.rejectButton]}
            onPress={() => handleRejectRequest(item.id)}
          >
            <Text style={[styles.requestButtonText, styles.rejectButtonText]}>
              {t('friends.reject')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Tab selector for Friends/Requests */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, !showingRequests && styles.activeTab]}
            onPress={() => setShowingRequests(false)}
          >
            <Text
              style={[styles.tabText, !showingRequests && styles.activeTabText]}
            >
              {t('friends.title')}
            </Text>
            {friends.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{friends.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, showingRequests && styles.activeTab]}
            onPress={() => setShowingRequests(true)}
          >
            <Text
              style={[styles.tabText, showingRequests && styles.activeTabText]}
            >
              {t('friends.pendingRequests')}
            </Text>
            {pendingRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Add Friend Button */}
        <TouchableOpacity
          style={styles.addFriendButton}
          onPress={navigateToAddFriend}
        >
          <Ionicons
            name='person-add-outline'
            size={20}
            color={colors.lightText}
          />
          <Text style={styles.addFriendText}>{t('friends.addFriend')}</Text>
        </TouchableOpacity>

        {loadingFriends ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={colors.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refreshFriends}
            >
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : showingRequests ? (
          // Pending requests list
          <FlatList
            data={pendingRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name='people-outline'
                  size={60}
                  color={colors.border}
                />
                <Text style={styles.emptyText}>
                  {t('friends.noPendingRequests')}
                </Text>
              </View>
            }
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        ) : (
          // Friends list
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name='people-outline'
                  size={60}
                  color={colors.border}
                />
                <Text style={styles.emptyText}>{t('friends.noFriends')}</Text>
                <Text style={styles.emptySubtext}>
                  {t('friends.addFriendPrompt')}
                </Text>
              </View>
            }
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.md,
  },
  tabContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.lightText,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.lightText,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addFriendButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingVertical: 12,
  },
  // Continuación de los estilos para app/friends/index.tsx

  addFriendText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.md,
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
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  friendItem: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.md,
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
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  requestItem: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  requestActions: {
    flexDirection: 'row',
  },
  requestButton: {
    borderRadius: 6,
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderColor: colors.error,
    borderWidth: 1,
  },
  requestButtonText: {
    color: colors.lightText,
    fontSize: 14,
    fontWeight: '500',
  },
  rejectButtonText: {
    color: colors.error,
  },
});
