/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TFunction } from 'i18next';
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

import { styles } from '@styles/Explore';

import { CategoryCarousel, FilterItem } from './CategoryCarousel';
import { DatePickerModal } from './DatePickerModal';
import { PopulationSelector, PopulationItem } from './PopulationSelector';

interface FilterModalProps {
  visible: boolean;
  toggleFilterModal: () => void;
  startDate: Date | null;
  endDate: Date | null;
  openDatePicker: (mode: 'start' | 'end') => void;
  datePickerDate: Date;
  onDateChange: (event: unknown, date?: Date) => void;
  handleDatePickerConfirm: () => void;
  closeDatePicker: () => void;
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  filterCategories: {
    title: string;
    items: FilterItem[];
  }[];
  selectedCategories: Set<string>;
  onCategoryPress: (filterId: string) => void;
  populationList: PopulationItem[];
  selectedPopulation: string | null;
  setPopulationDropdownVisible: (visible: boolean) => void;
  populationDropdownVisible: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectPopulation: (populationId: string) => void;
  clearFilters: () => void;
  formatDate: (date: Date | null) => string;
  t: TFunction<'translation', undefined>; // Add t prop
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  toggleFilterModal,
  startDate,
  endDate,
  openDatePicker,
  datePickerDate,
  onDateChange,
  handleDatePickerConfirm,
  closeDatePicker,
  showStartDatePicker,
  showEndDatePicker,
  filterCategories,
  selectedCategories,
  onCategoryPress,
  populationList,
  selectedPopulation,
  setPopulationDropdownVisible,
  populationDropdownVisible,
  searchQuery,
  setSearchQuery,
  onSelectPopulation,
  clearFilters,
  formatDate,
  t, // Destructure t prop
}) => {
  return (
    <Modal
      animationType='slide'
      transparent
      visible={visible}
      onRequestClose={toggleFilterModal}
    >
      {/* El overlay: al pulsar en cualquier parte se cierra el modal */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalContainer}
        onPress={toggleFilterModal}
      >
        {/* Contenedor del contenido: evitar propagación para que no se cierre al tocar dentro */}
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.modalContent}>
            {/* Cabecera del modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('explore.filters.title')}
              </Text>
              <TouchableOpacity onPress={toggleFilterModal}>
                <Ionicons name='close' size={24} color='#333' />
              </TouchableOpacity>
            </View>

            {/* Rango de fechas */}
            <Text style={styles.sectionTitle}>
              {t('explore.filters.dateRange')}
            </Text>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity
                style={[styles.datePickerButton, { marginRight: 10 }]}
                onPress={() => openDatePicker('start')}
              >
                <Ionicons name='calendar-outline' size={20} color='#666' />
                <Text style={styles.datePickerButtonText}>
                  {startDate
                    ? formatDate(startDate)
                    : t('explore.filters.startDate')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.dateRangeSeparator}>-</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => openDatePicker('end')}
              >
                <Ionicons name='calendar-outline' size={20} color='#666' />
                <Text style={styles.datePickerButtonText}>
                  {endDate ? formatDate(endDate) : t('explore.filters.endDate')}
                </Text>
              </TouchableOpacity>
            </View>
            {Platform.OS === 'android' &&
              (showStartDatePicker || showEndDatePicker) && (
                <DateTimePicker
                  value={datePickerDate}
                  mode='date'
                  display='default'
                  onChange={onDateChange}
                />
              )}
            {Platform.OS === 'ios' &&
              (showStartDatePicker || showEndDatePicker) && (
                <DatePickerModal
                  visible={showStartDatePicker || showEndDatePicker}
                  onClose={closeDatePicker}
                  currentMode={showStartDatePicker ? 'start' : 'end'}
                  datePickerDate={datePickerDate}
                  onDateChange={onDateChange}
                  onConfirm={handleDatePickerConfirm}
                />
              )}

            {/* Carrusel de Categorías */}
            <Text style={styles.sectionTitle}>
              {t('explore.filters.categories')}
            </Text>
            <CategoryCarousel
              filterCategories={filterCategories}
              selectedCategories={selectedCategories}
              onCategoryPress={onCategoryPress}
            />

            {/* Selector de población */}
            <Text style={styles.sectionTitle}>
              {t('explore.filters.population')}
            </Text>
            <TouchableOpacity
              style={styles.populationDropdownButton}
              onPress={() => setPopulationDropdownVisible(true)}
            >
              <Text style={styles.populationDropdownButtonText}>
                {selectedPopulation
                  ? (populationList.find((p) => p.id === selectedPopulation)
                      ?.label ?? t('explore.filters.selectPopulation'))
                  : t('explore.filters.selectPopulation')}
              </Text>
              <Ionicons name='chevron-down' size={20} color='#666' />
            </TouchableOpacity>

            {/* Acciones de filtros */}
            <View style={styles.filterActionsContainer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>
                  {t('explore.filters.clearFilters')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={toggleFilterModal}
              >
                <Text style={styles.applyButtonText}>
                  {t('explore.filters.applyFilters')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
      {/* Integración del PopulationSelector */}
      <PopulationSelector
        visible={populationDropdownVisible}
        onClose={() => setPopulationDropdownVisible(false)}
        selectedPopulation={selectedPopulation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        populations={populationList}
        onSelect={(populationId: string) => {
          onSelectPopulation(populationId);
          setPopulationDropdownVisible(false);
        }}
        t={t} // Pass t prop here
      />
    </Modal>
  );
};
