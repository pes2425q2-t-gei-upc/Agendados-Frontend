// src/Services/eventsService.ts

import { MarkerData } from '../(tabs)/exploreComponents/EventCard'; // Ajusta la ruta según tu estructura

import { getUserToken } from './AuthService';

export const getEvents = async (): Promise<MarkerData[]> => {
  try {
    const response = await fetch('https://agendados-backend-842309366027.europe-southwest1.run.app/api/events');
    if (!response.ok) {
      throw new Error('Error al cargar los eventos');
    }
    const eventsFromBackend = await response.json();
    const mappedEvents = eventsFromBackend
      .map((event: any) => {
        // Verificar que el evento tenga coordenadas
        if (
          !event.location ||
          !event.location.latitude ||
          !event.location.longitude
        ) {
          return null;
        }
        const eventDate = new Date(event.date_ini);
        return {
          id: event.id,
          coordinate: {
            latitude: event.location.latitude,
            longitude: event.location.longitude,
          },
          title: event.title,
          description:
            event.categories && event.categories.length > 0
              ? `${event.categories[0].name} - ${event.location.town?.name ?? ''}`
              : event.description,
          image:
            event.images && event.images.length > 0
              ? event.images[0].image_url
              : require('@assets/images/ReyLeon.jpg'),
          date: eventDate.toLocaleDateString('ca-ES', {
            day: '2-digit',
            month: 'short',
          }),
          time: eventDate.toLocaleTimeString('ca-ES', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          fullDate: eventDate,
          category:
            event.categories && event.categories.length > 0
              ? event.categories[0].name
              : '',
          // Extraemos también el id de la categoría
          categoryId:
            event.categories && event.categories.length > 0
              ? event.categories[0].id
              : null,
          location: event.location.town?.name ?? '',
        } as MarkerData;
      })
      .filter((event: MarkerData | null) => event !== null);
    return mappedEvents;
  } catch (error) {
    throw error;
  }
};

export const getEventDetails = async (
  eventId: string | number
): Promise<any> => {
  try {
    const response = await fetch(`https://agendados-backend-842309366027.europe-southwest1.run.app/api/events/${eventId}`);
    if (!response.ok) {
      throw new Error('Error al cargar los detalles del evento');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getEventRecomendations = async (): Promise<any> => {
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
    return await response.json();
  } catch (error) {
    throw error;
  }
};
