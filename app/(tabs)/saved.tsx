/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SavedEventCard from '@components/SavedEventCard';
import { Event } from '@models/Event';
import {
  colors,
  globalStyles,
  typography,
  spacing,
} from '@styles/globalStyles';
import { useFavorites } from 'app/context/FavoritesContext';

// Helper function to filter and sort events by end date
const filterAndSortEvents = (events: Event[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate date 5 years from now
  const fiveYearsFromNow = new Date(today);
  fiveYearsFromNow.setFullYear(today.getFullYear() + 5);

  const relevantEvents = events.filter((event) => {
    const endDate = event.date_end
      ? new Date(event.date_end)
      : new Date(event.date_ini);
    endDate.setHours(0, 0, 0, 0);

    // Filter events that end in the future but not more than 5 years from now
    return endDate >= today && endDate <= fiveYearsFromNow;
  });

  // Sort by end date (earliest ending first)
  return relevantEvents.sort((a, b) => {
    const endDateA = a.date_end ? new Date(a.date_end) : new Date(a.date_ini);
    const endDateB = b.date_end ? new Date(b.date_end) : new Date(b.date_ini);
    return endDateA.getTime() - endDateB.getTime();
  });
};

export default function SavedEvents() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Usar el contexto de favoritos
  const { favorites, removeFavorite, refreshFavorites } = useFavorites();

  const handleDeleteEvent = useCallback(
    (id: number) => {
      // Llamar directamente al método del contexto para eliminar el favorito
      removeFavorite(id).catch(() => {
        // Error handling removed
      });
    },
    [removeFavorite]
  );

  const sortedEvents = useMemo(
    () => filterAndSortEvents(favorites),
    [favorites]
  );

  // Efecto para cargar los favoritos cuando el componente se monta (solo una vez)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshFavorites();
      } catch (error) {
        // Error handling removed
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <GestureHandlerRootView style={styles.rootContainer}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={colors.primary} />
            <Text style={styles.loadingText}>{t('saved.loadingEvents')}</Text>
          </View>
        ) : (
          <FlatList
            data={sortedEvents}
            renderItem={({ item }) => (
              <SavedEventCard
                event={item}
                onRemoved={() => handleDeleteEvent(item.id)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            initialNumToRender={10}
            ListEmptyComponent={
              sortedEvents.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {t('saved.noSavedEvents')}
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  rootContainer: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
});
