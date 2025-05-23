import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import { colors, spacing } from '../../styles/globalStyles';
import FriendsList from '../components/FriendsList';
import ProfileAvatar from '../components/ProfileAvatar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useFriendship } from '../context/FriendshipContext';
import { Friendship } from '../Models/Friendship';

export default function FriendsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    friends,
    pendingRequests,
    loadingFriends,
    errorMessage,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refreshFriends,
  } = useFriendship();

  const [showingRequests, setShowingRequests] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  useEffect(() => {
    console.log('FriendsScreen: Amigos actuales:', friends.length);
    console.log(
      'FriendsScreen: Solicitudes pendientes:',
      pendingRequests.length
    );
  }, [friends, pendingRequests]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshFriends();
    } catch (error) {
      console.error('Error refreshing friends:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToAddFriend = () => {
    router.push('/friends/add');
  };

  const handleRemoveFriend = async (friendshipId: number) => {
    try {
      const success = await removeFriend(friendshipId);
      if (success) {
        Alert.alert(t('common.success'), t('friends.friendRemoved'));
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      Alert.alert(t('common.error'), String(error));
    }
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    if (processingIds.includes(friendshipId)) {
      return;
    }
    setProcessingIds((prev) => [...prev, friendshipId]);
    try {
      const success = await acceptFriendRequest(friendshipId);
      if (success) {
        Alert.alert(t('common.success'), t('friends.friendAccepted'));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert(t('common.error'), String(error));
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== friendshipId));
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    if (processingIds.includes(friendshipId)) {
      return;
    }
    setProcessingIds((prev) => [...prev, friendshipId]);
    try {
      const success = await rejectFriendRequest(friendshipId);
      if (success) {
        Alert.alert(t('common.success'), t('friends.friendRejected'));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert(t('common.error'), String(error));
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== friendshipId));
    }
  };

  const renderRequestItem = ({ item }: { item: Friendship }) => {
    if (!item.user) {
      console.log('Solicitud sin usuario remitente:', item);
      return null;
    }
    const friendInfo = item.user;
    const friendName = friendInfo.name ?? friendInfo.username ?? 'Usuario';
    const isProcessing = processingIds.includes(item.id);

    return (
      <View style={styles.requestItem}>
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
        {isProcessing ? (
          <ActivityIndicator size='small' color={colors.primary} />
        ) : (
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={[styles.requestButton, styles.acceptButton]}
              onPress={() => handleAcceptRequest(item.id)}
            >
              <Text style={styles.requestButtonText}>
                {t('friends.accept')}
              </Text>
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
        )}
      </View>
    );
  };

  // Header personalizado
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name='chevron-back' size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>
          {showingRequests ? t('friends.pendingRequests') : t('friends.title')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {showingRequests
            ? `${pendingRequests.length} ${t('friends.pending')}`
            : `${friends.length} ${t('friends.total')}`}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.headerActionButton}
        onPress={navigateToAddFriend}
      >
        <Ionicons name='person-add' size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle='dark-content'
          backgroundColor={colors.background}
        />
        {renderHeader()}
        <View style={styles.container}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, !showingRequests && styles.activeTab]}
              onPress={() => setShowingRequests(false)}
            >
              <Text
                style={[
                  styles.tabText,
                  !showingRequests && styles.activeTabText,
                ]}
              >
                {t('friends.friends')}
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
                style={[
                  styles.tabText,
                  showingRequests && styles.activeTabText,
                ]}
              >
                {t('friends.requests')}
              </Text>
              {pendingRequests.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingRequests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {errorMessage ? (
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
            <FlatList
              data={pendingRequests}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                loadingFriends ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color={colors.primary} />
                    <Text style={styles.loadingText}>
                      {t('common.loading')}
                    </Text>
                  </View>
                ) : (
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
                )
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <FriendsList
              friends={friends}
              isLoading={loadingFriends}
              isRefreshing={refreshing}
              onRefresh={handleRefresh}
              onRemoveFriend={handleRemoveFriend}
              emptyMessage={t('friends.noFriends')}
            />
          )}
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  acceptButton: {
    backgroundColor: colors.primary,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  activeTabText: {
    color: colors.lightText,
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    padding: 8,
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
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
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
  header: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerActionButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    padding: 8,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.md,
  },
  listContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 60,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderColor: colors.error,
    borderWidth: 1,
  },
  rejectButtonText: {
    color: colors.error,
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
  requestButtonText: {
    color: colors.lightText,
    fontSize: 14,
    fontWeight: '500',
  },
  requestItem: {
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
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  tabText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});
