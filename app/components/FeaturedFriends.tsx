// app/components/FeaturedFriends.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Friendship } from '@models/Friendship';

import { colors, spacing } from '../../styles/globalStyles';

import ProfileAvatar from './ProfileAvatar';

interface FeaturedFriendsProps {
  friends: Friendship[];
  isLoading: boolean;
  onSeeAllPress: () => void;
}

const FeaturedFriends: React.FC<FeaturedFriendsProps> = ({
  friends,
  onSeeAllPress,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  // Navegar a la página de eventos del amigo
  const navigateToFriendEvents = (friendId: number, friendName: string) => {
    router.push({
      pathname: '/friends/[id]/events',
      params: { id: friendId, name: friendName },
    });
  };

  // Si no hay amigos, mostrar botón para añadir
  if (friends.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('friends.title')}</Text>
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>{t('profile.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addFriendsButton}
          onPress={onSeeAllPress}
        >
          <Ionicons name='people-outline' size={24} color={colors.primary} />
          <Text style={styles.addFriendsText}>{t('friends.addFriend')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mostrar hasta 4 amigos destacados
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('friends.title')}</Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>{t('profile.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.friendsContainer}>
        {friends.slice(0, 4).map((friendship, index) => {
          const friend = friendship.friend;
          if (!friend) {
            return null;
          }

          return (
            <TouchableOpacity
              key={index}
              style={styles.friendBubble}
              onPress={() =>
                navigateToFriendEvents(
                  friend.id,
                  friend.name ?? friend.username
                )
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
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  friendBubble: {
    alignItems: 'center',
    width: '23%',
  },
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
  sectionContainer: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default memo(FeaturedFriends);
