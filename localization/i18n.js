import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa tus traducciones
import es from './translations/es.json';
import en from './translations/en.json';
import ca from './translations/ca.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  es: { translation: es },
  en: { translation: en },
  ca: { translation: ca }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Idioma predeterminado
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error al guardar el idioma:', error);
  }
};

export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('Error al cargar el idioma:', error);
  }
};

export default i18n;