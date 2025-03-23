import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { initializeLanguage } from 'localization/i18n';

import { EventsProvider } from './context/eventsContext';

export default function RootLayout() {
  useEffect(() => {
    // Inicializar el idioma al cargar la aplicación
    initializeLanguage();
  }, []);

  return (
    // Envuelves tu Stack dentro de EventsProvider
    <EventsProvider>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      </Stack>
    </EventsProvider>
  );
}
