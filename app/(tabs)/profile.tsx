// app/(tabs)/profile.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';

import EventDetailModal from '@components/EventDetailModal';
import { useAuth } from '@context/authContext';
import { useFavorites } from '@context/FavoritesContext';
import { useFriendship } from '@context/FriendshipContext';
import { Event } from '@models/Event';
import { colors, spacing } from '@styles/globalStyles';
import ProtectedRoute from 'app/components/ProtectedRoute';

import ProfileAvatar from '../components/ProfileAvatar';

export default function ProfileScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { userInfo, userToken, logout, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { favorites, refreshFavorites } = useFavorites();
  const { friends, refreshFriends } = useFriendship();

  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    savedEvents: 0,
    attendedEvents: 0,
    likedCategories: [] as { name: string; count: number }[],
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const navigateToFriends = () => router.push('/friends');
  const navigateToSettings = () => router.push('/config');
  const navigateToSaved = () => router.push('/saved');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshFavorites();
      await refreshFriends();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (favorites.length) {
      setRecentEvents(favorites.slice(0, 3));
      const allCats = favorites.flatMap(
        (e) => e.categories?.map((c) => c.name) || []
      );
      const counts: Record<string, number> = {};
      allCats.forEach((c) => (counts[c] = (counts[c] || 0) + 1));
      const liked = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      setStats({
        savedEvents: favorites.length,
        attendedEvents: Math.floor(favorites.length * 0.7),
        likedCategories: liked,
      });
    } else {
      setRecentEvents([]);
      setStats({ savedEvents: 0, attendedEvents: 0, likedCategories: [] });
    }
  }, [favorites]);

  const formatJoinDate = (d: Date) =>
    d.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric',
      month: 'long',
    });

  const showAvatarOptions = () => {
    Alert.alert(
      t('settings.changeProfilePhoto'),
      '',
      [
        { text: t('settings.takePhoto'), onPress: handleTakePhoto },
        { text: t('settings.chooseFromLibrary'), onPress: pickImage },
        { text: t('common.cancel'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const pickImage = async () => {
    try {
      console.log('[pickImage] Requesting media library permissions...');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[pickImage] Media library permission status:', permissionResult.status);

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          t('settings.permissionRequired'),
          t('settings.galleryPermissionMessage')
        );
        return;
      }

      console.log('[pickImage] Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      console.log('[pickImage] Image library result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('[pickImage] Image selected:', result.assets[0].uri);
        await handleUpdateAvatar(result.assets[0].uri);
      } else {
        console.log('[pickImage] Image selection canceled or no assets.');
      }
    } catch (error) {
      console.error('[pickImage] Error:', error);
      Alert.alert(t('common.error'), t('settings.galleryError'));
    }
  };

  const handleTakePhoto = async () => {
    try {
      console.log('[handleTakePhoto] Requesting camera permissions...');
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      console.log('[handleTakePhoto] Camera permission status:', permissionResult.status);

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          t('settings.permissionRequired'),
          t('settings.cameraPermissionMessage')
        );
        return;
      }

      console.log('[handleTakePhoto] Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      console.log('[handleTakePhoto] Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('[handleTakePhoto] Photo taken:', result.assets[0].uri);
        await handleUpdateAvatar(result.assets[0].uri);
      } else {
        console.log('[handleTakePhoto] Photo taking canceled or no assets.');
      }
    } catch (error) {
      console.error('[handleTakePhoto] Error:', error);
      Alert.alert(t('common.error'), t('settings.cameraError'));
    }
  };

  const handleUpdateAvatar = async (uri: string) => {
    if (!userToken) {
      return;
    }
    try {
      setUploadingAvatar(true);
      // await uploadAvatar(userToken, uri);
      await new Promise((r) => setTimeout(r, 1500));
      await updateUserProfile({ avatar: uri });
    } catch {
      Alert.alert(t('settings.error'), t('settings.updateProfileError'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('profile.logoutConfirmation'), t('profile.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: async () => {
          setIsLoading(true);
          await logout();
          router.replace('/registerLogin');
        },
      },
    ]);
  };

  const joinDate = userInfo?.createdAt
    ? new Date(userInfo.createdAt)
    : new Date(2023, 2, 15);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* — Header — */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <ProfileAvatar
              avatar={userInfo?.avatar ?? null}
              savedEventsCount={stats.savedEvents}
              isLoading={uploadingAvatar}
              onPress={showAvatarOptions}
              size={90}
              showEditButton
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userInfo?.name ?? userInfo?.username ?? 'Usuario'}
              </Text>
              <Text style={styles.userHandle}>
                @{userInfo?.username ?? 'username'}
              </Text>
              <Text style={styles.joinDate}>
                {t('profile.joinedOn', { date: formatJoinDate(joinDate) })}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={navigateToSettings}
          >
            <Ionicons name='settings-outline' size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* — Stats — */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.savedEvents}</Text>
            <Text style={styles.statLabel}>{t('profile.savedEvents')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.attendedEvents}</Text>
            <Text style={styles.statLabel}>{t('profile.attendedEvents')}</Text>
          </View>
        </View>

        {/* — Badge Level — */}
        {stats.savedEvents > 0 && (
          <View style={styles.badgeLevelContainer}>
            <View style={styles.badgeLevelInfo}>
              {stats.savedEvents < 30 ? (
                <>
                  <Text style={styles.badgeLevelText}>
                    {stats.savedEvents >= 16
                      ? t('profile.badgeLevels.advanced')
                      : stats.savedEvents >= 6
                        ? t('profile.badgeLevels.intermediate')
                        : t('profile.badgeLevels.basic')}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        t('profile.badgeLevels.badgeTooltip'),
                        t('profile.badgeLevels.nextLevel', {
                          count:
                            stats.savedEvents >= 16
                              ? 30 - stats.savedEvents
                              : stats.savedEvents >= 6
                                ? 16 - stats.savedEvents
                                : 6 - stats.savedEvents,
                        })
                      )
                    }
                  >
                    <Ionicons
                      name='information-circle-outline'
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.premiumBadgeContainer}>
                  <Ionicons name='star' size={14} color='#FFD700' />
                  <Text
                    style={[styles.badgeLevelText, styles.premiumBadgeText]}
                  >
                    {t('profile.badgeLevels.premium')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.badgeProgressContainer}>
              <View style={styles.badgeProgressBackground}>
                <View
                  style={[
                    styles.badgeProgress,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                      width: `${Math.min(100, (stats.savedEvents / 30) * 100)}%`,
                      backgroundColor:
                        stats.savedEvents >= 30
                          ? '#FFD700'
                          : stats.savedEvents >= 16
                            ? '#1E90FF'
                            : stats.savedEvents >= 6
                              ? '#32CD32'
                              : '#C0C0C0',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* — Sección de Amigos — */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('friends.title')}</Text>
            <TouchableOpacity onPress={navigateToFriends}>
              <Text style={styles.seeAllText}>{t('profile.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          {friends.length > 0 ? (
            <View style={styles.friendsContainer}>
              {friends.slice(0, 4).map(({ friend }, i) =>
                friend ? (
                  <TouchableOpacity
                    key={i}
                    style={styles.friendBubble}
                    onPress={() =>
                      router.push({
                        pathname: '/friends/[id]/events',
                        params: {
                          id: friend.id,
                          name: friend.name ?? friend.username,
                        },
                      })
                    }
                  >
                    <ProfileAvatar
                      avatar={friend.avatar ?? null}
                      savedEventsCount={0}
                      size={60}
                      showEditButton={false}
                    />
                    <Text style={styles.friendBubbleName} numberOfLines={1}>
                      {friend.name ?? friend.username}
                    </Text>
                  </TouchableOpacity>
                ) : null
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addFriendsButton}
              onPress={navigateToFriends}
            >
              <Ionicons
                name='people-outline'
                size={24}
                color={colors.primary}
              />
              <Text style={styles.addFriendsText}>
                {t('friends.addFriend')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* — Categorías Favoritas — */}
        {stats.likedCategories.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {t('profile.favoriteCategories')}
            </Text>
            <View style={styles.categoriesContainer}>
              {stats.likedCategories.map((c, i) => (
                <View key={i} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{c.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* — Eventos Recientes — */}
        {recentEvents.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t('profile.recentlySaved')}
              </Text>
              <TouchableOpacity onPress={navigateToSaved}>
                <Text style={styles.seeAllText}>{t('profile.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.eventsContainer}>
              {recentEvents.map((event, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.eventCard}
                  onPress={() => {
                    setSelectedEvent(event);
                    setDetailModalVisible(true);
                  }}
                >
                  <Image
                    source={
                      event.images?.[0]
                        ? { uri: event.images[0].image_url }
                        : require('@assets/images/FotoJazz.jpg')
                    }
                    style={styles.eventImage}
                  />
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventDate}>
                      {new Date(event.date_ini).toLocaleDateString()}
                    </Text>
                    {event.categories?.[0] && (
                      <View style={styles.eventCategoryTag}>
                        <Text style={styles.eventCategoryText}>
                          {event.categories[0].name}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* — Acciones Rápidas — */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToSettings}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name='person-circle-outline'
                size={24}
                color={colors.primary}
              />
            </View>
            <Text style={styles.actionText}>{t('profile.editProfile')}</Text>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToSaved}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name='bookmark-outline'
                size={24}
                color={colors.primary}
              />
            </View>
            <Text style={styles.actionText}>{t('navigation.saved')}</Text>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToFriends}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name='people-outline'
                size={24}
                color={colors.primary}
              />
            </View>
            <Text style={styles.actionText}>{t('friends.title')}</Text>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert('Notificaciones', 'Función en desarrollo')
            }
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name='notifications-outline'
                size={24}
                color={colors.primary}
              />
            </View>
            <Text style={styles.actionText}>{t('settings.notifications')}</Text>
            <Ionicons
              name='chevron-forward'
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <View style={[styles.actionIcon, styles.logoutIcon]}>
              <Ionicons name='log-out-outline' size={24} color={colors.error} />
            </View>
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Agendados v1.0.0</Text>

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
      </ScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  actionIcon: { alignItems: 'center', width: 40 },
  actionText: { color: colors.text, flex: 1, fontSize: 16 },

  actionsContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    elevation: 2,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addFriendsButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.md,
  },
  addFriendsText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  avatarContainer: { alignItems: 'center', flexDirection: 'row' },
  badgeLevelContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    elevation: 2,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  badgeLevelInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },

  badgeLevelText: { color: colors.text, fontSize: 14, fontWeight: '600' },

  badgeProgress: { borderRadius: 4, height: '100%' },
  badgeProgressBackground: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  badgeProgressContainer: { height: 8, width: '100%' },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  categoryTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },

  categoryText: { color: colors.lightText, fontSize: 14, fontWeight: '500' },
  container: { backgroundColor: colors.background, flex: 1 },
  divider: {
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    width: 1,
  },
  eventCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    width: '31%',
  },
  eventCategoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  eventCategoryText: { color: colors.lightText, fontSize: 10 },
  eventDate: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  eventDetails: { padding: 8 },

  eventImage: { height: 90, width: '100%' },
  eventTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  friendBubble: { alignItems: 'center', width: '23%' },

  friendBubbleName: {
    color: colors.text,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },
  friendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  header: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  joinDate: { color: colors.textSecondary, fontSize: 14 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },

  loadingText: { color: colors.textSecondary, marginTop: 10 },
  logoutButton: { borderBottomWidth: 0, marginTop: spacing.xs },
  logoutIcon: {},

  logoutText: { color: colors.error, flex: 1, fontSize: 16, fontWeight: '500' },
  premiumBadgeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  premiumBadgeText: { color: '#B8860B', marginLeft: 4 },
  sectionContainer: { marginBottom: spacing.lg, marginHorizontal: spacing.lg },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  seeAllText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    elevation: 2,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    top: spacing.md,
    width: 40,
  },

  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  statValue: { color: colors.primary, fontSize: 24, fontWeight: 'bold' },
  statsContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userHandle: { color: colors.textSecondary, fontSize: 16, marginBottom: 4 },
  userInfo: { flex: 1, marginLeft: spacing.md },
  userName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  versionText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginVertical: spacing.xl,
    textAlign: 'center',
  },
});
