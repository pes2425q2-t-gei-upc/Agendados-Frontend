// app/_layout.tsx
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { FavoritesProvider } from '@context/FavoritesContext';
import { FriendshipProvider } from '@context/FriendshipContext'; // Nuevo import
import { colors } from '@styles/globalStyles';
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
                  headerShown: false, // Ocultamos el header por defecto
                  title: 'Configuración', // Este título no se verá porque headerShown es false
                  animation: 'slide_from_right', // Animación lateral
                  presentation: 'card', // Presentación normal de tipo tarjeta
                }}
              />
            </Stack>
          </FriendshipProvider>
        </FavoritesProvider>
      </EventsProvider>
    </AuthProvider>
  );
}
