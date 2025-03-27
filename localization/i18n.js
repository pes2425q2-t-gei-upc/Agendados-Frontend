/* eslint-disable import/no-named-as-default-member */
import AsyncStorage from '@react-native-async-storage/async-storage';
// eslint-disable-next-line import/no-named-as-default
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importamos los recursos de traducción
import translationCA from './translations/ca.json';
import translationEN from './translations/en.json';
import translationES from './translations/es.json';

// Configuración de recursos
const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
  ca: {
    translation: translationCA,
  },
};

// Configurar i18n
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3', // Necesario para Android
  resources,
  lng: 'es', // Idioma por defecto
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
  // Añadimos pluralización
  pluralSeparator: '_',
  keySeparator: '.',
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
