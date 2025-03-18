import { DetailedEvent } from '@models/DetailedEvent';
import { EventDTO, Event } from '@models/Event';

import { MockDataService } from './MockDataService';

export class DataService {
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

  async getEvents(limit: number = 10): Promise<Event[]> {
    if (this.useFakeBackend) {
      return this.mockService.getEvents();
    }

    try {
      const response = await fetch(`${this.baseUrl}/events?&limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((eventDto: EventDTO) => new Event(eventDto));
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

      const data: DetailedEvent = await response.json();
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
    try {
      const response = await fetch(
        `${this.baseUrl}/events/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Error searching events: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((eventDto: EventDTO) => new Event(eventDto));
    } catch (error) {
      console.error('Failed to search events:', error);
      throw error;
    }
  }
}

//TODO: Like Method, Reject Method
