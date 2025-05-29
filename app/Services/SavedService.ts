// app/Services/SavedService.ts
import { Event, EventDTO } from '@models/Event';

import { getUserToken } from './AuthService';

export class SavedService {
  private static baseUrl: string =
    'https://agendados-backend-842309366027.europe-southwest1.run.app/api';

  /**
   * Gets the authentication token from storage
   * @returns The authentication token
   */
  private static async getAuthToken(): Promise<string> {
    try {
      const token = await getUserToken();
      if (!token) {
        console.error('No authentication token found in storage');
        throw new Error('Authentication token is missing');
      }
      return token;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      throw new Error('Authentication token is missing or invalid');
    }
  }

  /**
   * Retrieves all favorite events for the current user
   * @returns Promise with array of Events
   */
  public static async getFavorites(): Promise<Event[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/events/favorites`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
          accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch favorites: ${response.status}`);
      }
      const data: EventDTO[] = await response.json();
      return data.map((eventDto) => new Event(eventDto));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * Retrieves all favorite events for a specific user
   * @param userId The ID of the user whose favorites to retrieve
   * @returns Promise with array of Events
   */
  public static async getUserFavorites(userId: number): Promise<Event[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/events/user/${userId}/favorites`,
        {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
            accept: 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch user favorites: ${response.status}`);
      }
      const data: EventDTO[] = await response.json();
      return data.map((eventDto) => new Event(eventDto));
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }
  }

  public static async addFavorite(eventId: number): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/events/${eventId}/favorites`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to add to favorites: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  public static async removeFavorite(eventId: number): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/events/${eventId}/favorites`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to remove from favorites: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  public static async isFavorite(eventId: number): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(
        `${this.baseUrl}/events/${eventId}/favorites/check`,
        {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
            accept: 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to check favorite status: ${response.status}`);
      }
      const data = await response.json();
      return !!data.is_favorite;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }
}
