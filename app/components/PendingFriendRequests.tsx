// app/components/PendingFriendRequests.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Friendship } from '@models/Friendship';

import { colors, spacing } from '../../styles/globalStyles';

import ProfileAvatar from './ProfileAvatar';

interface PendingFriendRequestsProps {
  requests: Friendship[];
  onAccept: (friendshipId: number) => Promise<void>;
  onReject: (friendshipId: number) => Promise<void>;
}

const PendingFriendRequests: React.FC<PendingFriendRequestsProps> = ({
  requests,
  onAccept,
  onReject,
}) => {
  const { t } = useTranslation();
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  // Solo mostrar solicitudes recibidas (donde el usuario actual es el receptor)
  const receivedRequests = requests.filter(
    (req) => req.user && req.user.id !== req.friend?.id
  );

  // Si no hay solicitudes pendientes, no mostrar nada
  if (receivedRequests.length === 0) {
    return null;
  }

  // Manejar la aceptación de una solicitud
  const handleAccept = async (friendshipId: number) => {
    if (processingIds.includes(friendshipId)) {
      return;
    }

    setProcessingIds((prev) => [...prev, friendshipId]);
    try {
      await onAccept(friendshipId);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== friendshipId));
    }
  };

  // Manejar el rechazo de una solicitud
  const handleReject = async (friendshipId: number) => {
    if (processingIds.includes(friendshipId)) {
      return;
    }

    setProcessingIds((prev) => [...prev, friendshipId]);
    try {
      await onReject(friendshipId);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== friendshipId));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name='notifications' size={20} color={colors.primary} />
        <Text style={styles.title}>
          {t('friends.pendingRequests')} ({receivedRequests.length})
        </Text>
      </View>

      {receivedRequests.map((request) => {
        const user = request.user;
        if (!user) {
          return null;
        }

        const isProcessing = processingIds.includes(request.id);

        return (
          <View key={request.id} style={styles.requestItem}>
            <ProfileAvatar
              avatar={user.avatar ?? null}
              size={40}
              showEditButton={false}
              savedEventsCount={0}
            />
            <View style={styles.requestInfo}>
              <Text style={styles.userName}>{user.name ?? user.username}</Text>
              <Text style={styles.requestText}>
                {t('friends.wantsToBeYourFriend')}
              </Text>
            </View>
            {isProcessing ? (
              <ActivityIndicator size='small' color={colors.primary} />
            ) : (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAccept(request.id)}
                >
                  <Text style={styles.acceptButtonText}>
                    {t('friends.accept')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(request.id)}
                >
                  <Text style={styles.rejectButtonText}>
                    {t('friends.reject')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  acceptButton: {
    backgroundColor: colors.primary,
  },
  acceptButtonText: {
    color: colors.lightText,
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    borderRadius: 6,
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
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
  header: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderColor: colors.error,
    borderWidth: 1,
  },
  rejectButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
  requestInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  requestItem: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
  },
  requestText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  userName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default memo(PendingFriendRequests);
