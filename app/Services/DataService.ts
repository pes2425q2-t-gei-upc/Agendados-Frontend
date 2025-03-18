import { DetailedEvent } from '@models/DetailedEvent';
import { Event } from '@models/Event';

import { IEventService } from './IEventService';
import { MockDataService } from './MockDataService';

export class DataService implements IEventService {
  private baseUrl: string;
  private useFakeBackend: boolean;
  private mockService: MockDataService;

  constructor(
    baseUrl: string = 'https://api.agendados.com',
    useFakeBackend: boolean = false
  ) {
    this.baseUrl = baseUrl;
    this.useFakeBackend = useFakeBackend;
    this.mockService = new MockDataService();
  }

  /**
   * Set whether to use fake backend or real API
   */
  setUseFakeBackend(useFake: boolean): void {
    this.useFakeBackend = useFake;
  }

  /**
   * Fetches a list of events, optionally personalized for a specific user
   * @param page Page number for pagination
   * @param limit Number of events per page
   * @param userId Optional user ID for personalized recommendations
   * @returns Promise with an array of Event objects
   */
  async getEvents(
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<Event[]> {
    if (this.useFakeBackend) {
      return this.mockService.getEvents(page, limit, userId);
    }

    try {
      const userParam = userId ? `&userId=${userId}` : '';
      const response = await fetch(
        `${this.baseUrl}/events?page=${page}&limit=${limit}${userParam}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((eventDto: any) => new Event(eventDto));
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }

  /**
   * Fetches detailed information for a specific event
   * @param eventId The ID of the event to fetch
   * @returns Promise with a DetailedEvent object
   */
  async getEventDetails(eventId: string): Promise<DetailedEvent> {
    if (this.useFakeBackend) {
      return this.mockService.getEventDetails(eventId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}`);

      if (!response.ok) {
        throw new Error(`Error fetching event details: ${response.statusText}`);
      }

      const data = await response.json();
      return new DetailedEvent(data);
    } catch (error) {
      console.error(`Failed to fetch details for event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Searches for events based on a query string
   * @param query Search query
   * @param page Page number for pagination
   * @param limit Number of events per page
   * @returns Promise with an array of Event objects
   */
  async searchEvents(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Event[]> {
    if (this.useFakeBackend) {
      return this.mockService.searchEvents(query, page, limit);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/events/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Error searching events: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((eventDto: any) => new Event(eventDto));
    } catch (error) {
      console.error('Failed to search events:', error);
      throw error;
    }
  }
}
