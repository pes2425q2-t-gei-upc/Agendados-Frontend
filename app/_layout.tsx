// app/_layout.tsx
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FavoritesProvider } from '@context/FavoritesContext';
import { FriendshipProvider } from '@context/FriendshipContext';
import { initializeLanguage } from 'localization/i18n';

import { AuthProvider } from './context/authContext';
import { EventsProvider } from './context/eventsContext';
import './utils/disableConsole';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  useEffect(() => {
    // Inicializar el idioma al cargar la aplicación
    initializeLanguage();
  }, []);

  return (
    <SafeAreaProvider>
      <RootSiblingParent>
        <AuthProvider>
          <EventsProvider>
            <FavoritesProvider>
              <FriendshipProvider>
                <Stack>
                  <Stack.Screen
                    name='(tabs)'
                    options={{ headerShown: false }}
                  />
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
                    options={{ headerShown: false }}
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
                  <Stack.Screen
                    name='PrivacyPolicy'
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name='TermsOfService'
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name='rooms'
                    options={{
                      headerShown: false,
                      animation: 'slide_from_right',
                      presentation: 'card',
                    }}
                  />
                  <Stack.Screen
                    name='roomDetail'
                    options={{
                      headerShown: false,
                      animation: 'slide_from_right',
                      presentation: 'card',
                    }}
                  />
                  <Stack.Screen
                    name='createRoom'
                    options={{
                      headerShown: false,
                      animation: 'slide_from_right',
                      presentation: 'card',
                    }}
                  />
                  <Stack.Screen
                    name='roomMatching'
                    options={{
                      headerShown: false,
                      animation: 'slide_from_right',
                      presentation: 'card',
                    }}
                  />
                </Stack>
              </FriendshipProvider>
            </FavoritesProvider>
          </EventsProvider>
        </AuthProvider>
      </RootSiblingParent>
    </SafeAreaProvider>
  );
}
