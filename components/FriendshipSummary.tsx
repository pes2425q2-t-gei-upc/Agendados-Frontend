// app/components/FriendshipSummary.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Friendship } from '@models/Friendship';

import { colors, spacing } from '../styles/globalStyles';

interface FriendshipSummaryProps {
  friends: Friendship[];
  pendingRequests: Friendship[];
}

const FriendshipSummary: React.FC<FriendshipSummaryProps> = ({
  friends,
  pendingRequests,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  // Contar solicitudes recibidas (no enviadas)
  const receivedRequests = pendingRequests.filter(
    (req) => req.user && req.user.id !== req.friend?.id
  ).length;

  const navigateToFriends = () => {
    router.push('/friends');
  };

  const navigateToAddFriend = () => {
    router.push('/friends/add');
  };

  if (friends.length === 0 && receivedRequests === 0) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={navigateToFriends}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name='people' size={20} color={colors.primary} />
          <Text style={styles.title}>{t('friends.friendsSummary')}</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={navigateToAddFriend}
        >
          <Ionicons
            name='person-add-outline'
            size={18}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{friends.length}</Text>
          <Text style={styles.statLabel}>{t('friends.title')}</Text>
        </View>

        {receivedRequests > 0 && (
          <View style={styles.statItem}>
            <View style={styles.badgeContainer}>
              <Text style={styles.statValue}>{receivedRequests}</Text>
              <View style={styles.badge} />
            </View>
            <Text style={styles.statLabel}>{t('friends.requests')}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.seeAll}>
          {t('profile.seeAll')}{' '}
          <Ionicons name='chevron-forward' size={14} color={colors.primary} />
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.primary,
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 6,
    height: 6,
    position: 'absolute',
    right: -4,
    top: 0,
    width: 6,
  },
  badgeContainer: {
    position: 'relative',
  },
  container: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    elevation: 2,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.md,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  seeAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  statValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default memo(FriendshipSummary);
