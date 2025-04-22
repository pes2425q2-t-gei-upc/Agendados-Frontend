import React from 'react';
import { View } from 'react-native';
import type { Ionicons as IoniconsType } from '@expo/vector-icons';

import { SearchBar } from './SearchBar';
import { ActiveFilters } from './ActiveFilters';
import { styles } from '@styles/Explore';

// Define the type for filter categories based on its structure
interface FilterCategoryItem {
  id: string;
  labelKey: string; // Keep original key for potential use
  label: string; // Add the translated label
  icon: keyof typeof IoniconsType.glyphMap;
}

interface FilterCategoryGroup {
  titleKey: string; // Keep original key
  title: string; // Add the translated title
  items: FilterCategoryItem[];
}

interface FilterControlsProps {
  inputText: string;
  setInputText: (text: string) => void;
  setSearchQuery: (query: string) => void;
  toggleFilterModal: () => void;
  selectedCategories: Set<string>;
  selectedPopulation: string | null;
  startDate: Date | null;
  endDate: Date | null;
  clearFilters: () => void;
  handleCategoryPress: (categoryId: string) => void;
  filterCategories: FilterCategoryGroup[]; // Use the defined type
  formatDate: (date: Date | null) => string;
}

// Export the component
export const FilterControls: React.FC<FilterControlsProps> = ({
  inputText,
  setInputText,
  setSearchQuery,
  toggleFilterModal,
  selectedCategories,
  selectedPopulation,
  startDate,
  endDate,
  clearFilters,
  handleCategoryPress,
  filterCategories,
  formatDate,
}) => {
  return (
    <View style={styles.searchContainer}>
      <SearchBar
        inputText={inputText}
        setInputText={setInputText}
        setSearchQuery={setSearchQuery}
        toggleFilterModal={toggleFilterModal}
      />
      <ActiveFilters
        selectedCategories={selectedCategories}
        selectedPopulation={selectedPopulation}
        startDate={startDate}
        endDate={endDate}
        clearFilters={clearFilters}
        handleCategoryPress={handleCategoryPress}
        filterCategories={filterCategories}
        formatDate={formatDate}
      />
    </View>
  );
};

