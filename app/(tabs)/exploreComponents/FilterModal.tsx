// components/FilterModal.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Platform } from 'react-native';

import { DatePickerModal } from 'app/(tabs)/exploreComponents/DatePickerModal';

import { styles } from '../../../styles/Explore';

import { CategoryCarousel, FilterItem } from './CategoryCarousel';
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
}) => {
  return (
    <Modal
      animationType='slide'
      transparent
      visible={visible}
      onRequestClose={toggleFilterModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Cabecera del modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Personalización de búsqueda</Text>
            <TouchableOpacity onPress={toggleFilterModal}>
              <Ionicons name='close' size={24} color='#333' />
            </TouchableOpacity>
          </View>

          {/* Rango de fechas */}
          <Text style={styles.sectionTitle}>Rango de fechas</Text>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={[styles.datePickerButton, { marginRight: 10 }]}
              onPress={() => openDatePicker('start')}
            >
              <Ionicons name='calendar-outline' size={20} color='#666' />
              <Text style={styles.datePickerButtonText}>
                {startDate ? formatDate(startDate) : 'Fecha inicio'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dateRangeSeparator}>-</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => openDatePicker('end')}
            >
              <Ionicons name='calendar-outline' size={20} color='#666' />
              <Text style={styles.datePickerButtonText}>
                {endDate ? formatDate(endDate) : 'Fecha fin'}
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
          {/* DatePicker para iOS (integrado en un modal personalizado) */}
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
          <Text style={styles.sectionTitle}>Categorías</Text>
          <CategoryCarousel
            filterCategories={filterCategories}
            selectedCategories={selectedCategories}
            onCategoryPress={onCategoryPress}
          />

          {/* Selector de población */}
          <Text style={styles.sectionTitle}>Población</Text>
          <TouchableOpacity
            style={styles.populationDropdownButton}
            onPress={() => setPopulationDropdownVisible(true)}
          >
            <Text style={styles.populationDropdownButtonText}>
              {selectedPopulation
                ? (populationList.find((p) => p.id === selectedPopulation)
                    ?.label ?? 'Seleccionar población')
                : 'Seleccionar población'}
            </Text>
            <Ionicons name='chevron-down' size={20} color='#666' />
          </TouchableOpacity>

          {/* Acciones de filtros */}
          <View style={styles.filterActionsContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Limpiar filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={toggleFilterModal}
            >
              <Text style={styles.applyButtonText}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Integración del PopulationSelector por encima */}
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
      />
    </Modal>
  );
};
