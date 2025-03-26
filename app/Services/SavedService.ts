import Constants from 'expo-constants';

import { Event, EventDTO } from '@models/Event';

export class SavedService {
  private static baseUrl: string = 'http://localhost:8000/api';

  /**
   * Gets the authentication token from Expo Constants
   * @returns The authentication token
   */
  private static getAuthToken(): string {
    const token = Constants.expoConfig?.extra?.Token;
    // Fallback if token is not defined
    if (!token) {
      throw new Error('Authentication token is missing');
    }
    return token;
  }

  /**
   * Retrieves all favorite events for the current user
   * @returns Promise with array of Events
   */
  public static async getFavorites(): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/events/favorites`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${this.getAuthToken()}`,
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
   * Adds an event to the user's favorites
   * @param eventId ID of the event to add to favorites
   * @returns Promise with the response
   */
  public static async addFavorite(eventId: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/events/${eventId}/favorites`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${this.getAuthToken()}`,
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

  /**
   * Removes an event from the user's favorites
   * @param eventId ID of the event to remove from favorites
   * @returns Promise with the response
   */
  public static async removeFavorite(eventId: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/events/${eventId}/favorites`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${this.getAuthToken()}`,
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

  /**
   * Checks if an event is in the user's favorites
   * @param eventId ID of the event to check
   * @returns Promise with boolean indicating if event is a favorite
   */
  public static async isFavorite(eventId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/events/${eventId}/favorites/check`,
        {
          method: 'GET',
          headers: {
            Authorization: `Token ${this.getAuthToken()}`,
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
