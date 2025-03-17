import { DetailedEventDTO, DetailedEvent } from '@models/DetailedEvent';
import { EventDTO, Event } from '@models/Event';

export class DataService {
  private baseUrl: string;
  private useFakeBackend: boolean;
  private mockEvents: EventDTO[];
  private mockDetailedEvents: DetailedEventDTO[];

  constructor(
    baseUrl: string = 'https://api.agendados.com',
    useFakeBackend: boolean = false
  ) {
    this.baseUrl = baseUrl;
    this.useFakeBackend = useFakeBackend;
    this.initializeMockData();
  }

  /**
   * Initializes mock data for fake backend
   */
  private initializeMockData(): void {
    // Initialize mock events
    this.mockEvents = [
      {
        id: '1',
        title: 'Concert in the Park',
        location: 'Central Park',
        startDate: new Date(2023, 7, 15, 18, 0),
        endDate: new Date(2023, 7, 15, 22, 0),
        coverImage: require('@assets/images/FotoJazz.jpg'),
        categories: ['Music', 'Outdoor'],
      },
      {
        id: '2',
        title: 'Tech Conference',
        location: 'Convention Center',
        startDate: new Date(2023, 8, 10, 9, 0),
        endDate: new Date(2023, 8, 12, 17, 0),
        coverImage: require('@assets/images/FotoJazz.jpg'),
        categories: ['Technology', 'Business'],
      },
      {
        id: '3',
        title: 'Food Festival',
        location: 'Downtown Square',
        startDate: new Date(2023, 9, 5, 11, 0),
        endDate: new Date(2023, 9, 5, 20, 0),
        coverImage: require('@assets/images/FotoConcierto.jpg'),
        categories: ['Food', 'Culture'],
      },
    ];

    // Initialize mock detailed events
    this.mockDetailedEvents = [
      {
        ...this.mockEvents[0],
        images: [
          'https://example.com/images/concert1.jpg',
          'https://example.com/images/concert2.jpg',
          'https://example.com/images/concert3.jpg',
        ],
        description:
          'Join us for a night of amazing music under the stars. Featuring top artists and great food.',
        price: 45.99,
        ticketsAvailable: 250,
      },
      {
        ...this.mockEvents[1],
        images: [
          'https://example.com/images/conference.jpg',
          'https://example.com/images/conf-hall.jpg',
          'https://example.com/images/speakers.jpg',
        ],
        description:
          'A three-day conference featuring the latest in tech innovation and networking opportunities.',
        price: 299.99,
        ticketsAvailable: 500,
      },
      {
        ...this.mockEvents[2],
        images: [
          'https://example.com/images/food-fest.jpg',
          'https://example.com/images/food1.jpg',
          'https://example.com/images/food2.jpg',
        ],
        description:
          'Experience cuisines from around the world with over 50 food vendors and live cooking demonstrations.',
        price: 15.0,
        ticketsAvailable: 1000,
      },
    ];
  }

  /**
   * Set whether to use fake backend or real API
   */
  setUseFakeBackend(useFake: boolean): void {
    this.useFakeBackend = useFake;
  }

  /**
   * Fetches a list of events
   * @param page Page number for pagination
   * @param limit Number of events per page
   * @returns Promise with an array of Event objects
   */
  async getEvents(page: number = 1, limit: number = 10): Promise<Event[]> {
    if (this.useFakeBackend) {
      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEvents = this.mockEvents.slice(startIndex, endIndex);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      return paginatedEvents.map((eventDto) => new Event(eventDto));
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/events?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`);
      }

      const data = (await response.json()) as EventDTO[];
      return data.map((eventDto) => new Event(eventDto));
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
      // Find the event by ID in mock data
      const detailedEvent = this.mockDetailedEvents.find(
        (e) => e.id === eventId
      );

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!detailedEvent) {
        throw new Error(`Event with ID ${eventId} not found`);
      }

      return new DetailedEvent(detailedEvent);
    }

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}`);

      if (!response.ok) {
        throw new Error(`Error fetching event details: ${response.statusText}`);
      }

      const data = (await response.json()) as DetailedEventDTO;
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
      // Filter events that match the query
      const filteredEvents = this.mockEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          event.location.toLowerCase().includes(query.toLowerCase()) ||
          event.categories.some((cat) =>
            cat.toLowerCase().includes(query.toLowerCase())
          )
      );

      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      return paginatedEvents.map((eventDto) => new Event(eventDto));
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/events/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Error searching events: ${response.statusText}`);
      }

      const data = (await response.json()) as EventDTO[];
      return data.map((eventDto) => new Event(eventDto));
    } catch (error) {
      console.error('Failed to search events:', error);
      throw error;
    }
  }
}
