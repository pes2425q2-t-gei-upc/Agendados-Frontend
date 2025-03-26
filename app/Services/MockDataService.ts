import { EventDTO, Event } from '@models/Event';

export class MockDataService {
  private mockEvents: EventDTO[] = [];

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
  }

  /**
   * Obtiene una lista de eventos, opcionalmente personalizados para un usuario
   */
  async getEvents(): Promise<Event[]> {
    // Simula un retardo en la red
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockEvents.map((eventDto) => new Event(eventDto));
  }
}
