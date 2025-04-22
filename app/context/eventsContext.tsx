// context/EventsContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { Event as EventModel } from '../Models/Event';
import { getEventsWithLocations } from '../Services/EventsService';
interface EventsContextType {
  events: EventModel[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const EventsContext = createContext<EventsContextType>({
  events: [],
  loading: false,
  error: null,
  refetch: () => {},
});

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<EventModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data: EventModel[] = await getEventsWithLocations();
      setEvents(data);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError("No s'han pogut carregar els esdeveniments.");
      console.error('Error al cargar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const refetch = () => {
    fetchEvents();
  };

  return (
    <EventsContext.Provider value={{ events, loading, error, refetch }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => useContext(EventsContext);
