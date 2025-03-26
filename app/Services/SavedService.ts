import { Event, EventDTO } from '@models/Event';

export class SavedService {
  //private static baseUrl: string = 'http://10.0.2.2:8000/api';
  private static baseUrl: string = 'http://localhost:8000/api';

  /**
   * Gets the authentication token from localStorage
   * @returns The authentication token
   */
  private static getAuthToken(): string {
    //return localStorage.getItem('auth_token') ?? '';
    return 'e980e7bbc587901ee39672cc5c2d98338eedafe7';
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
      console.error('Error fetching favorites :', error);
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
}
