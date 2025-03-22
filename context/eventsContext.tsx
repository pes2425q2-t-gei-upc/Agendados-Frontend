import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { MarkerData } from '../app/(tabs)/exploreComponents/EventCard'; // Ajusta la ruta si es necesario
import { getEvents } from '../app/Services/EventsService'; // Ajusta la ruta a tu servicio

interface EventsContextType {
  events: MarkerData[];
  loading: boolean;
  error: string | null;
  refetch: () => void; // opcional, por si quieres volver a cargar datos
}

const EventsContext = createContext<EventsContextType>({
  events: [],
  loading: false,
  error: null,
  refetch: () => {},
});

// Este provider es el que envolverá tu app para pre-cargar los datos
export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los eventos
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
      setError(null);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("No s'han pogut carregar els esdeveniments.");
    } finally {
      setLoading(false);
    }
  };

  // Se llama al montar el provider
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

// Hook para usar el contexto en otros componentes
export const useEvents = () => {
  return useContext(EventsContext);
};
