// src/Services/eventsService.ts

import { Event, EventDTO } from '../Models/Event';

import { getUserToken } from './AuthService';

export const getEventChats = async (): Promise<Event[]> => {
  try {
    const token = await getUserToken();
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await fetch(
      `https://agendados-backend-842309366027.europe-southwest1.run.app/api/chat/events_where_user_messaged`,
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

    const ChatEvents: EventDTO[] = await response.json();
    const chatEvents = ChatEvents.map((eventData) => new Event(eventData));
    return chatEvents;
  } catch (error) {
    throw error;
  }
};
