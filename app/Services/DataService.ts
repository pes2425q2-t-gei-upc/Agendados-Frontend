import { DetailedEvent } from '@models/DetailedEvent';
import { EventDTO, Event } from '@models/Event';

import { MockDataService } from './MockDataService';

export class DataService {
  private baseUrl: string;
  private useFakeBackend: boolean;
  private mockService: MockDataService;

  constructor(
    baseUrl: string = 'http://localhost:8000',
    useFakeBackend: boolean = false
  ) {
    this.baseUrl = baseUrl;
    this.useFakeBackend = useFakeBackend;
    this.mockService = new MockDataService();
  }

  /**
   * Permite alternar entre backend real y fake.
   */
  setUseFakeBackend(useFake: boolean): void {
    this.useFakeBackend = useFake;
  }

  /**
   * Obtiene la lista de eventos.
   */
  async getEvents(limit: number = 10): Promise<Event[]> {
    if (this.useFakeBackend) {
      return this.mockService.getEvents();
    }
    try {
      const response = await fetch(`${this.baseUrl}/events?limit=${limit}`);
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
   * Obtiene la información detallada de un evento.
   */
  async getEventDetails(eventId: number): Promise<DetailedEvent> {
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
}
