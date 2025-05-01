import type { Ionicons as IoniconsType } from '@expo/vector-icons';

export const INITIAL_REGION = {
  latitude: 41.3851,
  longitude: 2.1734,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const INITIAL_BATCH = 100;
export const ZOOM_THRESHOLD = 14;

const rawCategories = [
  ['1', 'concerts', 'musical-notes-outline'],
  ['2', 'exhibitions', 'image-outline'],
  ['3', 'routes', 'map-outline'],
  ['4', 'festivals', 'sparkles-outline'],
  ['5', 'cycles', 'repeat-outline'],
  ['6', 'theater', 'film-outline'],
  ['7', 'conferences', 'mic-outline'],
  ['8', 'children', 'happy-outline'],
  ['9', 'commemorations', 'flag-outline'],
  ['10', 'holyWeek', 'flower-outline'],
  ['11', 'sardanas', 'people-circle-outline'],
  ['12', 'dance', 'body-outline'],
  ['13', 'courses', 'school-outline'],
  ['14', 'parties', 'beer-outline'],
  ['15', 'fairsMarkets', 'basket-outline'],
  ['16', 'giants', 'accessibility-outline'],
  ['17', 'circus', 'color-wand-outline'],
  ['18', 'digitalCulture', 'code-outline'],
  ['19', 'virtualActivities', 'globe-outline'],
];

export const filterCategoryKeys = [
  {
    titleKey: 'filters.category',
    items: rawCategories.map(([id, key, icon]) => ({
      id,
      labelKey: `categories.${key}`,
      icon: icon as keyof typeof IoniconsType.glyphMap,
    })),
  },
];
