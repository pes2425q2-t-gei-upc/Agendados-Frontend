import React, { createContext, useState, useContext, useEffect } from 'react';

import { Event } from '@models/Event';
import { SavedService } from '@services/SavedService';

// Define el tipo para el contexto
interface FavoritesContextType {
  favorites: Event[];
  favoriteIds: Set<number>;
  addFavorite: (event: Event) => Promise<boolean>;
  removeFavorite: (eventId: number) => Promise<boolean>;
  isFavorite: (eventId: number) => boolean;
  refreshFavorites: () => Promise<void>;
}

// Crea el contexto
const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

// Proveedor del contexto
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [, setIsInitialized] = useState(false);

  // Cargar favoritos al iniciar
  useEffect(() => {
    refreshFavorites();
  }, []);

  // Función para refrescar la lista de favoritos
  const refreshFavorites = async (): Promise<void> => {
    try {
      const favoritesData = await SavedService.getFavorites();
      setFavorites(favoritesData);

      // Actualizar el conjunto de IDs para consultas rápidas
      const ids = new Set(favoritesData.map((event) => Number(event.id)));
      setFavoriteIds(ids);

      setIsInitialized(true);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  };

  // Agregar un evento a favoritos
  const addFavorite = async (event: Event): Promise<boolean> => {
    if (!event.id) {
      return false;
    }

    const eventId = Number(event.id);
    try {
      // Llamar al API
      const success = await SavedService.addFavorite(eventId);

      if (success) {
        // Actualizar el estado local sin necesidad de recargar todos los favoritos
        setFavorites((prev) => {
          // Evitar duplicados
          if (!favoriteIds.has(eventId)) {
            return [...prev, event];
          }
          return prev;
        });

        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(eventId);
          return newSet;
        });
      }

      return success;
    } catch (error) {
      console.error('Error al añadir favorito:', error);
      return false;
    }
  };

  // Eliminar un evento de favoritos
  const removeFavorite = async (eventId: number): Promise<boolean> => {
    try {
      // Llamar al API
      const success = await SavedService.removeFavorite(eventId);

      if (success) {
        // Actualizar el estado local sin necesidad de recargar todos los favoritos
        setFavorites((prev) =>
          prev.filter((event) => Number(event.id) !== eventId)
        );

        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      }

      return success;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      return false;
    }
  };

  // Comprobar si un evento está en favoritos
  const isFavorite = (eventId: number): boolean => {
    return favoriteIds.has(eventId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites debe usarse dentro de un FavoritesProvider');
  }
  return context;
};
