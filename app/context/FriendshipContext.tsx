// app/context/FriendshipContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';

import { Friendship } from '@models/Friendship';
import { User } from '@models/User';
import { FriendshipService } from '@services/FriendshipService';

interface FriendshipContextType {
  friends: Friendship[];
  pendingRequests: Friendship[];
  loadingFriends: boolean;
  errorMessage: string | null;
  searchUsers: (query: string) => Promise<User[]>;
  sendFriendRequest: (friendId: number) => Promise<boolean>;
  acceptFriendRequest: (friendshipId: number) => Promise<boolean>;
  rejectFriendRequest: (friendshipId: number) => Promise<boolean>;
  removeFriend: (friendshipId: number) => Promise<boolean>;
  getFriendEvents: (friendId: number) => Promise<any[]>;
  refreshFriends: () => Promise<void>;
}

const FriendshipContext = createContext<FriendshipContextType | undefined>(
  undefined
);

export const FriendshipProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Agregar un control para evitar múltiples llamadas simultáneas
  const isRefreshing = useRef(false);
  const lastRefreshTime = useRef(0);

  // Usar useCallback para mantener referencia estable
  const refreshFriends = useCallback(async (): Promise<void> => {
    // Prevenir múltiples llamadas simultáneas
    if (isRefreshing.current) {
      console.log('Ya se está refrescando, ignorando llamada');
      return;
    }

    // Prevenir llamadas demasiado frecuentes (mínimo 1s entre llamadas)
    const now = Date.now();
    if (now - lastRefreshTime.current < 1000) {
      console.log('Refrescando demasiado rápido, ignorando llamada');
      return;
    }

    try {
      isRefreshing.current = true;
      setErrorMessage(null);

      // Solo mostrar cargando en la primera carga, no en refrescos
      if (friends.length === 0 && pendingRequests.length === 0) {
        setLoadingFriends(true);
      }

      // Obtener todas las amistades
      const friendships = await FriendshipService.getFriends();
      console.log('Amistades recibidas en el contexto:', friendships.length);

      // Obtener solicitudes pendientes por separado
      const pendingReqs = await FriendshipService.getPendingFriendRequests();
      console.log('Solicitudes pendientes en el contexto:', pendingReqs.length);

      // Asignar directamente los resultados (los objetos ya están validados en el servicio)
      setFriends(friendships);
      setPendingRequests(pendingReqs);

      // Actualizar timestamp del último refresco
      lastRefreshTime.current = Date.now();
    } catch (error) {
      console.error('Error refreshing friends:', error);
      setErrorMessage('Error al cargar amigos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoadingFriends(false);
      isRefreshing.current = false;
    }
  }, []);

  // Cargar amigos y solicitudes pendientes al inicio (una sola vez)
  useEffect(() => {
    console.log('FriendshipContext: cargando datos inicialmente');
    refreshFriends();
  }, []);

  const searchUsers = async (query: string): Promise<User[]> => {
    try {
      const users = await FriendshipService.searchUsers(query);
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      setErrorMessage(
        'Error al buscar usuarios. Por favor, inténtalo de nuevo.'
      );
      return [];
    }
  };

  const sendFriendRequest = async (friendId: number): Promise<boolean> => {
    try {
      await FriendshipService.sendFriendRequest(friendId);

      // Refrescar amigos y solicitudes después de enviar solicitud
      refreshFriends();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      setErrorMessage(
        'Error al enviar solicitud de amistad. Por favor, inténtalo de nuevo.'
      );
      return false;
    }
  };

  const acceptFriendRequest = async (
    friendshipId: number
  ): Promise<boolean> => {
    try {
      await FriendshipService.acceptFriendRequest(friendshipId);

      // Actualización optimista
      const acceptedRequest = pendingRequests.find(
        (r) => r.id === friendshipId
      );

      if (acceptedRequest) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));

        // Create a copy that preserves the prototype chain with isValid method
        const updatedFriendship = Object.create(
          Object.getPrototypeOf(acceptedRequest),
          Object.getOwnPropertyDescriptors(acceptedRequest)
        );
        updatedFriendship.status = 'accepted';

        setFriends((prev) => [...prev, updatedFriendship]);
      }

      // Refrescar en segundo plano para asegurar datos correctos
      refreshFriends();
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setErrorMessage(
        'Error al aceptar solicitud de amistad. Por favor, inténtalo de nuevo.'
      );
      return false;
    }
  };

  const rejectFriendRequest = async (
    friendshipId: number
  ): Promise<boolean> => {
    try {
      await FriendshipService.rejectFriendRequest(friendshipId);

      // Actualización optimista
      setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));

      // Refrescar en segundo plano
      refreshFriends();
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setErrorMessage(
        'Error al rechazar solicitud de amistad. Por favor, inténtalo de nuevo.'
      );
      return false;
    }
  };

  const removeFriend = async (friendshipId: number): Promise<boolean> => {
    try {
      await FriendshipService.removeFriend(friendshipId);

      // Actualización optimista
      setFriends((prev) => prev.filter((f) => f.id !== friendshipId));

      // Refrescar en segundo plano
      refreshFriends();
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      setErrorMessage(
        'Error al eliminar amistad. Por favor, inténtalo de nuevo.'
      );
      return false;
    }
  };

  const getFriendEvents = async (friendId: number): Promise<any[]> => {
    try {
      return await FriendshipService.getFriendEvents(friendId);
    } catch (error) {
      console.error('Error getting friend events:', error);
      setErrorMessage(
        'Error al obtener eventos del amigo. Por favor, inténtalo de nuevo.'
      );
      return [];
    }
  };

  return (
    <FriendshipContext.Provider
      value={{
        friends,
        pendingRequests,
        loadingFriends,
        errorMessage,
        searchUsers,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        getFriendEvents,
        refreshFriends,
      }}
    >
      {children}
    </FriendshipContext.Provider>
  );
};

export const useFriendship = (): FriendshipContextType => {
  const context = useContext(FriendshipContext);
  if (context === undefined) {
    throw new Error(
      'useFriendship debe usarse dentro de un FriendshipProvider'
    );
  }
  return context;
};
