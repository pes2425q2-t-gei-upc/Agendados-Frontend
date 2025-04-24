// app/Services/FriendshipService.ts
import { Friendship, FriendshipDTO } from '@models/Friendship';
import { User, UserDTO } from '@models/User';

import { getUserToken } from './AuthService';

export class FriendshipService {
  private static baseUrl: string =
    'https://agendados-backend-842309366027.europe-southwest1.run.app/api';
  //'http://localhost:8080/api';

  /**
   * Obtiene el token de autenticación
   */
  private static async getAuthToken(): Promise<string> {
    try {
      const token = await getUserToken();
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      return token;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      throw new Error('Authentication token is missing or invalid');
    }
  }

  /**
   * Obtiene la lista de amigos del usuario actual
   */
  public static async getFriends(): Promise<Friendship[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/users/friendships`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
          accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch friends: ${response.status}`);
      }

      const data: FriendshipDTO[] = await response.json();
      return data.map((friendship) => new Friendship(friendship));
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  }

  /**
   * Busca usuarios por término de búsqueda
   */
  public static async searchUsers(query: string): Promise<User[]> {
    const token = await this.getAuthToken();

    if (process.env.NODE_ENV === 'development') {
      console.log('Token usado:', token.substring(0, 10) + '...');
    }

    const url = new URL(`${this.baseUrl}/users/all`);
    url.searchParams.append('query', query);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.log('Status code:', response.status);
      console.log(
        'Response headers:',
        Object.fromEntries([...response.headers])
      );
      throw new Error(`Failed to search users: ${response.status}`);
    }

    const data: UserDTO[] = await response.json();
    return Array.isArray(data) ? data.map((user) => new User(user)) : [];
  }

  /**
   * Obtiene las solicitudes de amistad pendientes
   */
  public static async getPendingFriendRequests(): Promise<any[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/users/friendships/pending`,
        {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
            accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch pending requests: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pending friend requests:', error);
      throw error;
    }
  }

  /**
   * Envía una solicitud de amistad
   */
  public static async sendFriendRequest(friendId: number): Promise<Friendship> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/users/friendships/${friendId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send friend request: ${response.status}`);
      }

      const data: FriendshipDTO = await response.json();
      return new Friendship(data);
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Acepta una solicitud de amistad
   */
  public static async acceptFriendRequest(
    requestId: number
  ): Promise<Friendship> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/users/friendships/accept/${requestId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to accept friend request: ${response.status}`);
      }

      const data: FriendshipDTO = await response.json();
      return new Friendship(data);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  /**
   * Rechaza una solicitud de amistad
   */
  public static async rejectFriendRequest(requestId: number): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/users/friendships/decline/${requestId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reject friend request: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  /**
   * Elimina una amistad
   * Nota: Este endpoint no está definido en el OpenAPI, deberías verificar si existe en el backend
   */
  public static async removeFriend(friendId: number): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      // Esta URL es una suposición, necesitas confirmar la ruta correcta con el backend
      const response = await fetch(
        `${this.baseUrl}/users/friendships/${friendId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove friend: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  /**
   * Obtiene los eventos guardados por un amigo
   * Nota: Este endpoint no está definido en el OpenAPI, deberías verificar si existe en el backend
   */
  public static async getFriendEvents(friendId: number): Promise<any[]> {
    try {
      const token = await this.getAuthToken();
      // Esta URL es una suposición, necesitas confirmar la ruta correcta con el backend
      const response = await fetch(`${this.baseUrl}/users/${friendId}/events`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
          accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch friend events: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching friend events:', error);
      throw error;
    }
  }
}
