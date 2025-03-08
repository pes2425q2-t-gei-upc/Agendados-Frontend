import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { initializeLanguage } from '../localization/i18n';

export default function RootLayout() {
  useEffect(() => {
    // Inicializar el idioma al cargar la aplicación
    initializeLanguage();
  }, []);

  return (
    <Stack>
      <Stack.Screen name='index' options={{ title: 'Inicio' }} />
      <Stack.Screen name='config' options={{ title: 'Configuración' }} />
      <Stack.Screen name='mainPage' options={{ title: 'Pagina principal' }} />
    </Stack>
  );
}
