// app/friends/add.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { colors, spacing } from '../../styles/globalStyles';
import ProfileAvatar from '../components/ProfileAvatar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useFriendship } from '../context/FriendshipContext';
import { User } from '../Models/User';

export default function AddFriendScreen() {
  const { t } = useTranslation();
  const { searchUsers, sendFriendRequest, friends, pendingRequests } =
    useFriendship();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  // Buscar usuarios por nombre de usuario o email
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
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

  // Enviar solicitud de amistad
  const handleSendRequest = async (userId: number) => {
    if (processingIds.includes(userId)) {
      return;
    }

    setProcessingIds((prev) => [...prev, userId]);
    try {
      const success = await sendFriendRequest(userId);
      if (success) {
        // Actualizar UI localmente para mostrar que la solicitud fue enviada
        Alert.alert(t('common.success'), t('friends.friendRequestSent'));
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert(t('common.error'), String(error));
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  // Comprobar si ya es amigo
  const isFriend = useCallback(
    (userId: number) => {
      return friends.some(
        (f) => f.friend?.id === userId || f.user?.id === userId
      );
    },
    [friends]
  );

  // Comprobar si ya hay una solicitud pendiente
  const hasPendingRequest = useCallback(
    (userId: number) => {
      return pendingRequests.some(
        (req) => req.friend?.id === userId || req.user?.id === userId
      );
    },
    [pendingRequests]
  );

  // Renderizar un resultado de búsqueda de usuario
  const renderUserItem = ({ item }: { item: User }) => {
    const alreadyFriend = isFriend(item.id);
    const isPending = hasPendingRequest(item.id);
    const isProcessing = processingIds.includes(item.id);

    return (
      <View style={styles.userItem}>
        <ProfileAvatar
          avatar={item.avatar ?? null}
          savedEventsCount={0}
          size={40}
          showEditButton={false}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name ?? item.username}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
        </View>
        {isProcessing ? (
          <ActivityIndicator size='small' color={colors.primary} />
        ) : alreadyFriend ? (
          <View style={styles.alreadyFriendTag}>
            <Text style={styles.alreadyFriendText}>
              {t('friends.alreadyFriend')}
            </Text>
          </View>
        ) : isPending ? (
          <View style={styles.pendingTag}>
            <Text style={styles.pendingText}>
              {t('friends.pendingRequest')}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSendRequest(item.id)}
          >
            <Text style={styles.sendButtonText}>{t('friends.send')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('friends.searchUsers')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType='search'
            autoCapitalize='none'
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size='small' color={colors.lightText} />
            ) : (
              <Ionicons name='search' size={20} color={colors.lightText} />
            )}
          </TouchableOpacity>
        </View>

        {/* Texto de ayuda */}
        {searchQuery.trim() === '' && (
          <Text style={styles.helpText}>{t('friends.searchHelpText')}</Text>
        )}

        {/* Resultados de búsqueda */}
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            searchQuery.trim() !== '' && !isSearching ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name='search-outline'
                  size={60}
                  color={colors.border}
                />
                <Text style={styles.emptyText}>
                  {t('friends.noUsersFound')}
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={
            searchResults.length === 0 && searchQuery.trim() !== ''
              ? { flex: 1 }
              : null
          }
        />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  alreadyFriendTag: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  alreadyFriendText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.md,
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pendingTag: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    marginLeft: 8,
    width: 48,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    color: colors.text,
    flex: 1,
    fontSize: 16,
    padding: 12,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendButtonText: {
    color: colors.lightText,
    fontSize: 14,
    fontWeight: '500',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userItem: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  userUsername: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
