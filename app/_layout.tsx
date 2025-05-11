// app/_layout.tsx
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { FavoritesProvider } from '@context/FavoritesContext';
import { FriendshipProvider } from '@context/FriendshipContext';
import { initializeLanguage } from 'localization/i18n';

import { AuthProvider } from './context/authContext';
import { EventsProvider } from './context/eventsContext';

export default function RootLayout() {
  useEffect(() => {
    // Inicializar el idioma al cargar la aplicación
    initializeLanguage();
  }, []);

  return (
    <AuthProvider>
      <EventsProvider>
        <FavoritesProvider>
          <FriendshipProvider>
            <Stack>
              <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
              <Stack.Screen
                name='registerLogin'
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='chat'
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name='friends'
                options={{ headerShown: true, title: 'Amigos' }}
              />
              <Stack.Screen
                name='friendEvents'
                options={{
                  headerShown: true,
                  title: 'Eventos guardados por amigo',
                }}
              />
              <Stack.Screen
                name='config'
                options={{
                  headerShown: false,
                  title: 'Configuración',
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
            </Stack>
          </FriendshipProvider>
        </FavoritesProvider>
      </EventsProvider>
    </AuthProvider>
  );
}
