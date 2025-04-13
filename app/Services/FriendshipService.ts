// app/Services/FriendshipService.ts
import { Friendship, FriendshipDTO } from '@models/Friendship';
import { User, UserDTO } from '@models/User';

import { getUserToken } from './AuthService';

export class FriendshipService {
  private static baseUrl: string = 'http://localhost:8000/api';

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
      const response = await fetch(`${this.baseUrl}/friendships`, {
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
   * Busca usuarios por nombre de usuario o email
   */
  public static async searchUsers(query: string): Promise<User[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/users/search?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
            accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search users: ${response.status}`);
      }

      const data: UserDTO[] = await response.json();
      return data.map((user) => new User(user));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Envía una solicitud de amistad
   */
  public static async sendFriendRequest(friendId: number): Promise<Friendship> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/friendships`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend_id: friendId }),
      });

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
    friendshipId: number
  ): Promise<Friendship> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/friendships/${friendshipId}/accept`,
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
  public static async rejectFriendRequest(
    friendshipId: number
  ): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/friendships/${friendshipId}/reject`,
        {
          method: 'POST',
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
   */
  public static async removeFriend(friendshipId: number): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/friendships/${friendshipId}`,
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
   */
  public static async getFriendEvents(friendId: number): Promise<any[]> {
    try {
      const token = await this.getAuthToken();
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
