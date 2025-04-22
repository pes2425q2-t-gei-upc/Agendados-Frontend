import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ScrollView,
} from 'react-native';
import { TFunction } from 'i18next';

import { styles } from '../../../styles/Explore';

export type PopulationItem = {
  id: string;
  label: string;
};

interface PopulationSelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedPopulation: string | null;
  populations: PopulationItem[];
  onSelect: (populationId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  t: TFunction<"translation", undefined>;
}

export const PopulationSelector: React.FC<PopulationSelectorProps> = ({
  visible,
  onClose,
  selectedPopulation,
  populations,
  onSelect,
  t,
}) => {
  // Estado local para la búsqueda de poblaciones
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const filteredPopulations = !localSearchQuery.trim()
    ? populations
    : populations.filter((item) =>
        item.label.toLowerCase().includes(localSearchQuery.toLowerCase())
      );

  return (
    <Modal
      transparent
      animationType='slide'
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.dropdownOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.populationDropdownContainer}>
          <View style={styles.populationDropdownHeader}>
            <Text style={styles.populationDropdownTitle}>
              {t('explore.filters.selectPopulation')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name='close' size={24} color='#333' />
            </TouchableOpacity>
          </View>
          <View style={styles.searchPopulationContainer}>
            <Ionicons
              name='search'
              size={20}
              color='#666'
              style={styles.searchPopulationIcon}
            />
            <TextInput
              style={styles.searchPopulationInput}
              placeholder={t('explore.filters.searchPopulation')}
              value={localSearchQuery}
              onChangeText={setLocalSearchQuery}
              autoCapitalize='none'
              autoCorrect={false}
            />
            {localSearchQuery && (
              <TouchableOpacity
                onPress={() => setLocalSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Ionicons name='close-circle' size={16} color='#666' />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={styles.populationList}>
            {filteredPopulations.map((pop) => (
              <TouchableOpacity
                key={pop.id}
                style={[
                  styles.populationListItem,
                  selectedPopulation === pop.id &&
                    styles.populationListItemSelected,
                ]}
                onPress={() => onSelect(pop.id)}
              >
                <Text
                  style={[
                    styles.populationListItemText,
                    selectedPopulation === pop.id &&
                      styles.populationListItemTextSelected,
                  ]}
                >
                  {pop.label}
                </Text>
                {selectedPopulation === pop.id && (
                  <Ionicons name='checkmark' size={20} color='#fff' />
                )}
              </TouchableOpacity>
            ))}
            {filteredPopulations.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  {t('explore.filters.noResults')}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
