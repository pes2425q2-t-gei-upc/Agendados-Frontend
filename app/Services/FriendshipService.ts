// app/services/FriendshipService.ts
import { Friendship, FriendshipDTO } from '@models/Friendship';
import { User } from '@models/User';

import { getUserToken } from '../Services/AuthService';

const API_URL =
  'https://agendados-backend-842309366027.europe-southwest1.run.app/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getUserToken();
  console.log('FriendshipService: usando token →', token);
  if (!token) {
    throw new Error('No auth token found; please login again');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`,
  };
}

export class FriendshipService {
  static async getFriends(): Promise<Friendship[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/users/friendships`, { headers });
    if (res.status === 401) {
      console.error('getFriends: 401 Unauthorized. Cabeceras:', headers);
      throw new Error('No autorizado. Revisa tu token.');
    }
    if (!res.ok) {
      throw new Error(`Error ${res.status} fetching friends`);
    }
    const raw: any[] = await res.json();
    const dtos: FriendshipDTO[] = raw.map((item) => ({
      id: item.id ?? Date.now() + Math.random(), // Fallback ID if not provided
      status: 'accepted',
      friend: {
        ...item, // Preservar todos los campos del backend
        // Asegurar que tenemos los campos mínimos requeridos
        id: item.id,
        username: item.username,
        email: item.email,
        createdAt:
          item.createdAt ?? item.created_at ?? new Date().toISOString(),
      },
    }));
    return dtos.map((dto) => new Friendship(dto));
  }

  static async getPendingFriendRequests(): Promise<Friendship[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/users/friendships/pending`, {
      headers,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Error ${res.status} fetching pending requests`);
    }
    const rawList: any[] = await res.json();
    console.log('getPendingFriendRequests raw:', rawList);
    const dtos: FriendshipDTO[] = rawList.map((item) => ({
      id: item.id,
      status: 'pending',
      created_at: item.created_at,
      user: item.user_from,
      friend: item.user_to,
    }));
    return dtos.map((dto) => new Friendship(dto));
  }

  static async sendFriendRequest(userId: number): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/users/friendships/${userId}`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) {
      let msg = `Error ${res.status} sending friend request`;
      try {
        msg = (await res.json()).detail ?? msg;
      } catch {}
      throw new Error(msg);
    }
    if (
      res.status === 201 ||
      res.status === 204 ||
      res.headers.get('Content-Length') === '0'
    ) {
      return;
    }
    await res.json().catch(() => {});
  }

  static async acceptFriendRequest(requestId: number): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_URL}/users/friendships/accept/${requestId}`,
      { method: 'POST', headers }
    );
    if (!res.ok) {
      throw new Error(`Error ${res.status} accepting friend request`);
    }
  }

  static async rejectFriendRequest(requestId: number): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_URL}/users/friendships/decline/${requestId}`,
      { method: 'DELETE', headers }
    );
    if (!res.ok) {
      throw new Error(`Error ${res.status} rejecting friend request`);
    }
  }

  static async removeFriend(requestId: number): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/users/friendships/${requestId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      throw new Error(`Error ${res.status} removing friend`);
    }
  }

  static async searchUsers(query: string): Promise<User[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_URL}/users/all?query=${encodeURIComponent(query)}`,
      { headers }
    );
    if (!res.ok) {
      throw new Error(`Error ${res.status} searching users`);
    }
    const data: any[] = await res.json();
    return data.map((item) => new User(item));
  }

  static async getFriendEvents(friendId: number): Promise<any[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/users/${friendId}/events`, { headers });
    if (!res.ok) {
      throw new Error(`Error ${res.status} fetching friend events`);
    }
    return res.json();
  }
}
