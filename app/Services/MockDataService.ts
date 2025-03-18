import { DetailedEventDTO, DetailedEvent } from '@models/DetailedEvent';
import { EventDTO, Event } from '@models/Event';

export class MockDataService {
  private mockEvents: EventDTO[] = [];
  private mockDetailedEvents: DetailedEventDTO[] = [];

  constructor() {
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
        data: new Date(2023, 7, 15, 18, 0),
        coverImage: require('@assets/images/FotoJazz.jpg'),
        categoria: 'Music',
      },
      {
        id: '2',
        title: 'Tech Conference',
        location: 'Convention Center',
        data: new Date(2023, 8, 10, 9, 0),
        coverImage: require('@assets/images/FotoJazz.jpg'),
        categoria: 'Technology',
      },
      {
        id: '3',
        title: 'Food Festival',
        location: 'Downtown Square',
        data: new Date(2023, 9, 5, 11, 0),
        coverImage: require('@assets/images/FotoConcierto.jpg'),
        categoria: 'Food',
      },
    ];

    // Initialize mock detailed events
    this.mockDetailedEvents = [
      {
        ...this.mockEvents[0],
        images: [
          'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070&auto=format&fit=crop',
        ],
        description:
          'Join us for a night of amazing music under the stars. Featuring top artists and great food.',
        price: 45.99,
        ticketsAvailable: 250,
      },
      {
        ...this.mockEvents[1],
        images: [
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1475721027785-f74ec9c7180a?q=80&w=2076&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop',
        ],
        description:
          'A three-day conference featuring the latest in tech innovation and networking opportunities.',
        price: 299.99,
        ticketsAvailable: 500,
      },
      {
        ...this.mockEvents[2],
        images: [
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2087&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2081&auto=format&fit=crop',
        ],
        description:
          'Experience cuisines from around the world with over 50 food vendors and live cooking demonstrations.',
        price: 15.0,
        ticketsAvailable: 1000,
      },
    ];
  }

  /**
   * Fetches a list of events, optionally personalized for a specific user
   * @param page Page number for pagination
   * @param limit Number of events per page
   * @param userId Optional user ID for personalized recommendations
   * @returns Promise with an array of Event objects
   */
  async getEvents(): Promise<Event[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return this.mockEvents.map((eventDto) => new Event(eventDto));
  }

  /**
   * Fetches detailed information for a specific event
   * @param eventId The ID of the event to fetch
   * @returns Promise with a DetailedEvent object
   */
  async getEventDetails(eventId: string): Promise<DetailedEvent> {
    // Find the event by ID in mock data
    const detailedEvent = this.mockDetailedEvents.find((e) => e.id === eventId);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!detailedEvent) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    return new DetailedEvent(detailedEvent);
  }
}
