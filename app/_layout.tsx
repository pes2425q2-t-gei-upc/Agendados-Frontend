import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { initializeLanguage } from 'localization/i18n';

export default function RootLayout() {
  useEffect(() => {
    // Inicializar el idioma al cargar la aplicación
    initializeLanguage();
  }, []);

  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    </Stack>
  );
}
