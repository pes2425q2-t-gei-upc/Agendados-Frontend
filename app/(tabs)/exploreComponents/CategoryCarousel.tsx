// components/CategoryCarousel.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';

import { styles } from '../../../styles/Explore';

export type FilterItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

interface CategoryCarouselProps {
  filterCategories: { title: string; items: FilterItem[] }[];
  selectedCategories: Set<string>;
  onCategoryPress: (filterId: string) => void;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  filterCategories,
  selectedCategories,
  onCategoryPress,
}) => {
  // Combina todos los items de las categorías en una sola lista
  const allFilters = filterCategories.flatMap((category) => category.items);

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContainer}
    >
      {allFilters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.carouselItem,
            selectedCategories.has(filter.id) && styles.carouselItemActive,
          ]}
          onPress={() => onCategoryPress(filter.id)}
        >
          <Ionicons
            name={filter.icon}
            size={24}
            color={selectedCategories.has(filter.id) ? '#fff' : '#666'}
          />
          <Text
            style={[
              styles.carouselText,
              selectedCategories.has(filter.id) && styles.carouselTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
