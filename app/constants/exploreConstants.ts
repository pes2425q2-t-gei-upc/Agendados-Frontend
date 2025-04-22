import type { Ionicons as IoniconsType } from '@expo/vector-icons';

// Región inicial (Barcelona en este ejemplo)
export const INITIAL_REGION = {
  latitude: 41.3851,
  longitude: 2.1734,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Para carga progresiva de eventos
export const INITIAL_BATCH = 100;

// Umbral de zoom para controlar el clustering
export const ZOOM_THRESHOLD = 14;

// Define keys for filter categories, translation will happen in the component
export const filterCategoryKeys = [
  {
    titleKey: 'filters.category',
    items: [
      { id: '1', labelKey: 'categories.concerts', icon: 'musical-notes-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '2', labelKey: 'categories.exhibitions', icon: 'image-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '3', labelKey: 'categories.routes', icon: 'map-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '4', labelKey: 'categories.festivals', icon: 'sparkles-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '5', labelKey: 'categories.cycles', icon: 'repeat-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '6', labelKey: 'categories.theater', icon: 'film-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '7', labelKey: 'categories.conferences', icon: 'mic-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '8', labelKey: 'categories.children', icon: 'happy-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '9', labelKey: 'categories.commemorations', icon: 'flag-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '10', labelKey: 'categories.holyWeek', icon: 'flower-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '11', labelKey: 'categories.sardanas', icon: 'people-circle-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '12', labelKey: 'categories.dance', icon: 'body-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '13', labelKey: 'categories.courses', icon: 'school-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '14', labelKey: 'categories.parties', icon: 'beer-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '15', labelKey: 'categories.fairsMarkets', icon: 'basket-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '16', labelKey: 'categories.giants', icon: 'accessibility-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '17', labelKey: 'categories.circus', icon: 'color-wand-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '18', labelKey: 'categories.digitalCulture', icon: 'code-outline' as keyof typeof IoniconsType.glyphMap },
      { id: '19', labelKey: 'categories.virtualActivities', icon: 'globe-outline' as keyof typeof IoniconsType.glyphMap },
    ],
  },
];
