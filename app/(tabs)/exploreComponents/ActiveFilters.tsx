import React, { memo } from 'react';
import { FlatList, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Ionicons as IoniconsType } from '@expo/vector-icons';
import { styles } from '@styles/Explore'; // Corrected path
import { useTranslation } from 'react-i18next';

type FilterItem = {
  id: string;
  label: string;
  icon: keyof typeof IoniconsType.glyphMap;
};

type ActiveFiltersProps = {
  selectedCategories: Set<string>;
  selectedPopulation: string | null;
  startDate: Date | null;
  endDate: Date | null;
  clearFilters: () => void;
  handleCategoryPress: (id: string) => void;
  filterCategories: { title: string; items: FilterItem[] }[];
  formatDate: (date: Date | null) => string;
};

export const ActiveFilters = memo(
  ({
    selectedCategories,
    selectedPopulation,
    startDate,
    endDate,
    clearFilters,
    handleCategoryPress,
    filterCategories,
    formatDate,
  }: ActiveFiltersProps) => {
    const { t } = useTranslation();
    const data = [
      ...(selectedCategories.size > 0 || selectedPopulation
        ? [{ type: 'clear' as const }]
        : []),
      ...(startDate || endDate ? [{ type: 'date' as const }] : []),
      ...Array.from(selectedCategories).map((id) => ({
        type: 'category' as const,
        id,
        filter: filterCategories
          .flatMap((cat) => cat.items)
          .find((f) => f.id === id),
      })),
    ];

    return (
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item, index) =>
          item.type === 'category' && item.filter
            ? `cat-${item.id}`
            : `${item.type}-${index}`
        }
        renderItem={({ item }) => {
          if (item.type === 'clear') {
            return (
              <TouchableOpacity
                style={styles.clearFilterChip}
                onPress={clearFilters}
              >
                <Ionicons name="close-circle" size={16} color="#fff" />
                <Text style={styles.clearFilterText}>
                  {t('explore.search.clearFilters')}
                </Text>
              </TouchableOpacity>
            );
          }
          if (item.type === 'date') {
            return (
              <View style={styles.dateRangeChip}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.filterText}>
                  {startDate
                    ? formatDate(startDate)
                    : t('explore.filters.startDate')}{' '}
                  -{' '}
                  {endDate ? formatDate(endDate) : t('explore.filters.endDate')}
                </Text>
              </View>
            );
          }
          if (item.type === 'category' && item.filter) {
            return (
              <TouchableOpacity
                style={[styles.filterChip, styles.filterButtonActive]}
                onPress={() => handleCategoryPress(item.id)}
              >
                <Ionicons name={item.filter.icon} size={16} color="#fff" />
                <Text style={[styles.filterText, styles.filterTextActive]}>
                  {item.filter.label}
                </Text>
                <Ionicons
                  name="close-circle"
                  size={14}
                  color="#fff"
                  style={styles.removeFilterIcon}
                />
              </TouchableOpacity>
            );
          }
          return null;
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScrollContainer}
      />
    );
  }
);

ActiveFilters.displayName = 'ActiveFilters';
