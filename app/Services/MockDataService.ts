import { DetailedEventDTO, DetailedEvent } from '@models/DetailedEvent';
import { EventDTO, Event } from '@models/Event';

export class MockDataService {
  private mockEvents: EventDTO[] = [];
  private mockDetailedEvents: DetailedEventDTO[] = [];

  constructor() {
    this.initializeMockData();
  }

  /**
   * Inicializa datos mock para backend falso
   */
  private initializeMockData(): void {
    // Actualizamos los datos para que coincidan con la estructura de la API:
    this.mockEvents = [
      {
        id: 1,
        title: 'Concert in the Park',
        location: {
          id: 1,
          region: { id: 1, name: 'Cataluña' },
          town: { id: 2, name: 'Barcelona' },
          latitude: 41.3887,
          longitude: 2.187,
          address: 'Parc de la Ciutadella, Barcelona',
          space: 'Parc de la Ciutadella',
        },
        date_ini: new Date(2023, 7, 15, 18, 0).toISOString(),
        date_end: new Date(2023, 7, 15, 21, 0).toISOString(), // Ejemplo de fecha fin
        categories: [{ id: 1, name: 'Music' }],
        scopes: [],
        images: [],
        links: [],
        description: '',
        info_tickets: '',
        schedule: '',
      },
      {
        id: 2,
        title: 'Tech Conference',
        location: {
          id: 2,
          region: { id: 1, name: 'Cataluña' },
          town: { id: 2, name: 'Barcelona' },
          latitude: 41.378,
          longitude: 2.149,
          address: 'Fira de Barcelona, Barcelona',
          space: 'Fira de Barcelona',
        },
        date_ini: new Date(2023, 8, 10, 9, 0).toISOString(),
        date_end: new Date(2023, 8, 10, 17, 0).toISOString(),
        categories: [{ id: 2, name: 'Technology' }],
        scopes: [],
        images: [],
        links: [],
        description: '',
        info_tickets: '',
        schedule: '',
      },
      {
        id: 3,
        title: 'Food Festival',
        location: {
          id: 3,
          region: { id: 1, name: 'Cataluña' },
          town: { id: 2, name: 'Barcelona' },
          latitude: 41.382,
          longitude: 2.1734,
          address: 'Mercat de la Boqueria, Barcelona',
          space: 'Mercat de la Boqueria',
        },
        date_ini: new Date(2023, 9, 5, 11, 0).toISOString(),
        date_end: new Date(2023, 9, 5, 20, 0).toISOString(),
        categories: [{ id: 3, name: 'Food' }],
        scopes: [],
        images: [],
        links: [],
        description: '',
        info_tickets: '',
        schedule: '',
      },
    ];

    // Inicializamos eventos detallados propagando la propiedad "location"
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
   * Obtiene una lista de eventos, opcionalmente personalizados para un usuario
   */
  async getEvents(): Promise<Event[]> {
    // Simula un retardo en la red
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockEvents.map((eventDto) => new Event(eventDto));
  }

  /**
   * Obtiene información detallada de un evento específico
   */
  async getEventDetails(eventId: number): Promise<DetailedEvent> {
    const detailedEvent = this.mockDetailedEvents.find((e) => e.id === eventId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!detailedEvent) {
      throw new Error(`Event with ID ${eventId} not found`);
    }
    return new DetailedEvent(detailedEvent);
  }
}
