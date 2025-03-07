import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Recursos de traducción
const resources = {
  en: {
    translation: {
      welcome: 'Welcome to the App!',
      goToSettings: 'Go to Settings',
      settings: 'Settings',
      language: 'Language',
      spanish: 'Español',
      catalan: 'Català',
      english: 'English'
    }
  },
  es: {
    translation: {
      welcome: '¡Bienvenido a la Aplicación!',
      goToSettings: 'Ir a Configuración',
      settings: 'Configuración',
      language: 'Idioma',
      spanish: 'Español',
      catalan: 'Català',
      english: 'English'
    }
  },
  ca: {
    translation: {
      welcome: 'Benvingut a l\'Aplicació!',
      goToSettings: 'Anar a Configuració',
      settings: 'Configuració',
      language: 'Idioma',
      spanish: 'Español',
      catalan: 'Català',
      english: 'English'
    }
  }
};

// Configurar i18n
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3', // Necesario para Android
    resources,
    lng: 'es', // Idioma por defecto
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

// Función para cambiar el idioma
export const changeLanguage = async (language) => {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem('userLanguage', language);
};

// Función para inicializar el idioma desde el almacenamiento
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('userLanguage');
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Error al cargar el idioma:', error);
  }
};

export default i18n;