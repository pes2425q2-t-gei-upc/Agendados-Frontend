// src/Services/eventsService.ts

import { Event, EventDTO } from '../Models/Event';

import { getUserToken } from './AuthService';

export const getEventsWithLocations = async (): Promise<Event[]> => {
  try {
    const token = await getUserToken();
    const response = await fetch(
      'https://agendados-backend-842309366027.europe-southwest1.run.app/api/events',
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Error al cargar los eventos');
    }
    const eventsFromBackend: EventDTO[] = await response.json();
    const events = eventsFromBackend
      .filter(
        (event) =>
          event.location && event.location.latitude && event.location.longitude
      )
      .map((eventData) => new Event(eventData));

    return events;
  } catch (error) {
    throw error;
  }
};

export const getEventDetails = async (
  eventId: string | number
): Promise<Event> => {
  try {
    const response = await fetch(
      `https://agendados-backend-842309366027.europe-southwest1.run.app/api/events/${eventId}`
    );
    if (!response.ok) {
      throw new Error('Error al cargar los detalles del evento');
    }
    const eventData: EventDTO = await response.json();
    return new Event(eventData);
  } catch (error) {
    throw error;
  }
};

export const getEventRecomendations = async (): Promise<Event[]> => {
  try {
    const token = await getUserToken();
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await fetch(
      `https://agendados-backend-842309366027.europe-southwest1.run.app/api/events/recommended`,
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al cargar los detalles del evento');
    }

    const recommendedEventsData: EventDTO[] = await response.json();
    const recommendedEvents = recommendedEventsData.map(
      (eventData) => new Event(eventData)
    );
    return recommendedEvents;
  } catch (error) {
    throw error;
  }
};
