// app/hooks/useFriendship.tsx

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { Friendship } from '@models/Friendship';
import { User } from '@models/User';
import { FriendshipService } from '@services/FriendshipService';

/**
 * Hook personalizado para gestionar la lógica relacionada con amistades
 * Proporciona funciones para buscar usuarios, enviar/aceptar/rechazar solicitudes, etc.
 */
export const useFriendship = () => {
  const { t } = useTranslation();

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Obtener lista de amigos y solicitudes pendientes
  const fetchFriends = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const friendships = await FriendshipService.getFriends();

      // Separar amigos y solicitudes pendientes
      const acceptedFriendships = friendships.filter(
        (f) => f.status === 'accepted'
      );
      const pendingFriendships = friendships.filter(
        (f) => f.status === 'pending'
      );

      setFriends(acceptedFriendships);
      setPendingRequests(pendingFriendships);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError(t('friends.errorLoadingFriends'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  // Cargar amigos al inicializar
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Buscar usuarios para agregar como amigos
  const searchUsers = useCallback(
    async (query: string): Promise<User[]> => {
      if (!query.trim()) {
        return [];
      }

      try {
        const users = await FriendshipService.searchUsers(query);
        return users;
      } catch (err) {
        console.error('Error searching users:', err);
        Alert.alert(t('common.error'), t('friends.searchError'));
        return [];
      }
    },
    [t]
  );

  // Enviar solicitud de amistad
  const sendFriendRequest = useCallback(
    async (friendId: number): Promise<boolean> => {
      try {
        await FriendshipService.sendFriendRequest(friendId);
        fetchFriends(); // Actualizar lista en background
        return true;
      } catch (err) {
        console.error('Error sending friend request:', err);
        Alert.alert(t('common.error'), t('friends.sendRequestError'));
        return false;
      }
    },
    [fetchFriends, t]
  );

  // Aceptar solicitud de amistad
  const acceptFriendRequest = useCallback(
    async (friendshipId: number): Promise<boolean> => {
      try {
        await FriendshipService.acceptFriendRequest(friendshipId);

        // Actualización optimista
        const acceptedRequest = pendingRequests.find(
          (req) => req.id === friendshipId
        );
        if (acceptedRequest) {
          setPendingRequests((prev) =>
            prev.filter((req) => req.id !== friendshipId)
          );
          setFriends((prev) => [
            ...prev,
            {
              ...acceptedRequest,
              status: 'accepted',
              isValid: acceptedRequest?.isValid || (() => false),
            },
          ]);
        }

        // Actualizar en segundo plano
        fetchFriends();
        return true;
      } catch (err) {
        console.error('Error accepting friend request:', err);
        Alert.alert(t('common.error'), t('friends.acceptError'));
        return false;
      }
    },
    [fetchFriends, pendingRequests, t]
  );

  // Rechazar solicitud de amistad
  const rejectFriendRequest = useCallback(
    async (friendshipId: number): Promise<boolean> => {
      try {
        await FriendshipService.rejectFriendRequest(friendshipId);

        // Actualización optimista
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== friendshipId)
        );

        // Actualizar en segundo plano
        fetchFriends();
        return true;
      } catch (err) {
        console.error('Error rejecting friend request:', err);
        Alert.alert(t('common.error'), t('friends.rejectError'));
        return false;
      }
    },
    [fetchFriends, t]
  );

  // Eliminar amigo
  const removeFriend = useCallback(
    async (friendshipId: number): Promise<boolean> => {
      try {
        await FriendshipService.removeFriend(friendshipId);

        // Actualización optimista
        setFriends((prev) =>
          prev.filter((friend) => friend.id !== friendshipId)
        );

        // Actualizar en segundo plano
        fetchFriends();
        return true;
      } catch (err) {
        console.error('Error removing friend:', err);
        Alert.alert(t('common.error'), t('friends.removeError'));
        return false;
      }
    },
    [fetchFriends, t]
  );

  // Obtener eventos guardados por un amigo
  const getFriendEvents = useCallback(
    async (friendId: number) => {
      try {
        return await FriendshipService.getFriendEvents(friendId);
      } catch (err) {
        console.error('Error getting friend events:', err);
        Alert.alert(t('common.error'), t('friends.eventsError'));
        return [];
      }
    },
    [t]
  );

  // Refrescar lista de amigos (para pull-to-refresh)
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFriends();
  }, [fetchFriends]);

  return {
    friends,
    pendingRequests,
    loading,
    refreshing,
    error,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriendEvents,
    refresh,
  };
};
