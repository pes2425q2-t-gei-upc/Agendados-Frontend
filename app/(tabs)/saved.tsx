/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState, useEffect, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SavedEventCard from '@components/SavedEventCard';
import { useWelcome } from '@components/Welcome';
import { Event } from '@models/Event';
import {
  colors,
  globalStyles,
  typography,
  spacing,
} from '@styles/globalStyles';
import { useFavorites } from 'app/context/FavoritesContext';

// Helper function to group events by date
const groupEventsByDate = (events: Event[]) => {
  const grouped: Record<string, Event[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDatesInRange = (startDate: Date, endDate: Date) => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    const endDateOnly = new Date(endDate);
    endDateOnly.setHours(0, 0, 0, 0);

    if (endDateOnly < today) {
      return dates;
    }
    if (currentDate < today) {
      currentDate = new Date(today);
    }

    while (currentDate <= endDateOnly) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const relevantEvents = events.filter((event) => {
    const endDate = event.date_end
      ? new Date(event.date_end)
      : new Date(event.date_ini);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  });

  relevantEvents.forEach((event: Event) => {
    const startDate = new Date(event.date_ini);
    const endDate = event.date_end
      ? new Date(event.date_end)
      : new Date(event.date_ini);
    const eventDates = getDatesInRange(startDate, endDate);

    eventDates.forEach((date) => {
      const dateKey = date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      if (!grouped[dateKey].find((e) => e.id === event.id)) {
        grouped[dateKey].push(event);
      }
    });
  });

  return Object.keys(grouped)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((date) => ({
      date,
      events: grouped[date],
    }));
};

// Date Group Component
interface DateGroupProps {
  group: { date: string; events: Event[] };
  onDeleteEvent: (id: number) => void;
}

const DateGroup = memo(({ group, onDeleteEvent }: DateGroupProps) => {
  const { t } = useTranslation();
  const date = new Date(group.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = date.toDateString() === today.toDateString();

  // Obtener día de la semana y mes de las traducciones
  const weekdays = [
    t('days.sunday'),
    t('days.monday'),
    t('days.tuesday'),
    t('days.wednesday'),
    t('days.thursday'),
    t('days.friday'),
    t('days.saturday'),
  ];

  const months = [
    t('months.january'),
    t('months.february'),
    t('months.march'),
    t('months.april'),
    t('months.may'),
    t('months.june'),
    t('months.july'),
    t('months.august'),
    t('months.september'),
    t('months.october'),
    t('months.november'),
    t('months.december'),
  ];

  const weekday = weekdays[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();

  // Formatear la fecha usando traducciones personalizadas
  const formattedDate = `${weekday}, ${day} ${t('common.of')} ${month}`;

  return (
    <View style={styles.dateGroup}>
      <Text style={[styles.dateText, isToday && styles.todayText]}>
        {isToday ? `${t('saved.today')}, ${formattedDate}` : formattedDate}
      </Text>
      <View style={styles.eventsContainer}>
        {group.events.map((event: Event) => (
          <SavedEventCard
            key={event.id}
            event={event}
            onRemoved={() => onDeleteEvent(event.id)}
          />
        ))}
      </View>
    </View>
  );
});

DateGroup.displayName = 'DateGroup';

export default function SavedEvents() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  const { showWelcome } = useWelcome();

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

  const groupedEvents = useMemo(
    () => groupEventsByDate(favorites),
    [favorites]
  );

  useFocusEffect(
    useCallback(() => {
      if (showWelcome) {
        Alert.alert(
          'Tutorial en progreso',
          'Completa el tutorial antes de navegar.'
        );
        router.replace('/main'); // Redirige de nuevo a la pestaña principal
      }
    }, [showWelcome])
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        <Text style={typography.title}>{t('saved.title')}</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={colors.primary} />
            <Text style={styles.loadingText}>{t('saved.loadingEvents')}</Text>
          </View>
        ) : (
          <FlatList
            data={groupedEvents}
            renderItem={({ item }) => (
              <DateGroup group={item} onDeleteEvent={handleDeleteEvent} />
            )}
            keyExtractor={(item, index) => `${item.date}-${index}`} // Unique key using date and index
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            initialNumToRender={10}
            ListEmptyComponent={
              groupedEvents.length === 0 ? (
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
  dateGroup: {
    marginBottom: 30,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
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
  eventsContainer: {
    paddingLeft: 10,
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
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  todayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
