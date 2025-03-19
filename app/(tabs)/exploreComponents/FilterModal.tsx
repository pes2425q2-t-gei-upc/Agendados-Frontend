import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Platform } from 'react-native';

import { styles } from '../../../styles/Explore';

import { DatePickerModal } from './DatePickerModal';

interface FilterModalProps {
  visible: boolean;
  toggleFilterModal: () => void;
  startDate: Date | null;
  endDate: Date | null;
  openDatePicker: (mode: 'start' | 'end') => void;
  datePickerDate: Date;
  onDateChange: (event: any, date?: Date) => void;
  handleDatePickerConfirm: () => void;
  closeDatePicker: () => void;
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  filterCategories: {
    title: string;
    items: { id: string; label: string; icon: string }[];
  }[];
  activeFilters: Set<string>;
  handleFilterPress: (filterId: string) => void;
  populationList: { id: string; label: string }[];
  selectedPopulation: string | null;
  setPopulationDropdownVisible: (visible: boolean) => void;
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
  activeFilters,
  handleFilterPress,
  populationList,
  selectedPopulation,
  setPopulationDropdownVisible,
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Personalització de cerca</Text>
            <TouchableOpacity onPress={toggleFilterModal}>
              <Ionicons name='close' size={24} color='#333' />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>Rang de dates</Text>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={[styles.datePickerButton, { marginRight: 10 }]}
              onPress={() => openDatePicker('start')}
            >
              <Ionicons name='calendar-outline' size={20} color='#666' />
              <Text style={styles.datePickerButtonText}>
                {startDate ? formatDate(startDate) : 'Data inici'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dateRangeSeparator}>-</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => openDatePicker('end')}
            >
              <Ionicons name='calendar-outline' size={20} color='#666' />
              <Text style={styles.datePickerButtonText}>
                {endDate ? formatDate(endDate) : 'Data fi'}
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
          {Platform.OS === 'ios' && (
            <DatePickerModal
              visible={showStartDatePicker || showEndDatePicker}
              onClose={closeDatePicker}
              currentMode='start' // Ajusta este valor según sea necesario
              datePickerDate={datePickerDate}
              onDateChange={onDateChange}
              onConfirm={handleDatePickerConfirm}
            />
          )}
          {filterCategories.map((category, index) => (
            <View key={index}>
              <Text style={styles.sectionTitle}>{category.title}</Text>
              <View style={styles.filterGridContainer}>
                {category.items.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterGridItem,
                      activeFilters.has(filter.id) && styles.filterButtonActive,
                    ]}
                    onPress={() => handleFilterPress(filter.id)}
                  >
                    <Ionicons
                      name={filter.icon as any}
                      size={24}
                      color={activeFilters.has(filter.id) ? '#fff' : '#666'}
                    />
                    <Text
                      style={[
                        styles.filterGridText,
                        activeFilters.has(filter.id) && styles.filterTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          <View>
            <Text style={styles.sectionTitle}>Població</Text>
            <TouchableOpacity
              style={styles.populationDropdownButton}
              onPress={() => setPopulationDropdownVisible(true)}
            >
              <Text style={styles.populationDropdownButtonText}>
                {selectedPopulation
                  ? (populationList.find((p) => p.id === selectedPopulation)
                      ?.label ?? 'Seleccionar població')
                  : 'Seleccionar població'}
              </Text>
              <Ionicons name='chevron-down' size={20} color='#666' />
            </TouchableOpacity>
          </View>
          <View style={styles.filterActionsContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Esborrar filtres</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={toggleFilterModal}
            >
              <Text style={styles.applyButtonText}>Aplicar filtres</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
