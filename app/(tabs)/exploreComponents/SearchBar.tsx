import React, { memo } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@styles/Explore'; // Assuming styles are in this path
import { useTranslation } from 'react-i18next';// Adjust the import path as necessary

type SearchBarProps = {
  inputText: string;
  setInputText: (text: string) => void;
  setSearchQuery: (query: string) => void;
  toggleFilterModal: () => void;
};

export const SearchBar = memo(
  ({
    inputText,
    setInputText,
    setSearchQuery,
    toggleFilterModal,
  }: SearchBarProps) => {
    const { t } = useTranslation();
    return (
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={24}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t('explore.search.placeholder')}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => setSearchQuery(inputText)}
          returnKeyType="search"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          onPress={() => setSearchQuery(inputText)}
          style={styles.searchButton}
        >
          <Ionicons name="arrow-forward" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={toggleFilterModal}
        >
          <Ionicons name="options-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    );
  }
);

SearchBar.displayName = 'SearchBar';
