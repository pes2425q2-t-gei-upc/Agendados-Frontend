import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const markers = [
    {
      id: 1,
      coordinate: { latitude: 41.3851, longitude: 2.1734 },
      title: 'Esdeveniment 1',
      description: 'esports - centre - gratuït',
    },
    {
      id: 2,
      coordinate: { latitude: 41.3891, longitude: 2.1654 },
      title: 'Esdeveniment 2',
      description: 'cultura - eixample - pagament',
    },
    {
      id: 3,
      coordinate: { latitude: 41.3811, longitude: 2.1694 },
      title: 'Esdeveniment 3',
      description: 'esports - gràcia - pagament',
    },
    {
      id: 4,
      coordinate: { latitude: 41.3921, longitude: 2.1804 },
      title: 'Esdeveniment 4',
      description: 'cultura - centre - gratuït',
    },
  ];
  const filters = [
    { id: 'cultura', label: 'Cultura', icon: 'color-palette' as const },
    { id: 'esports', label: 'Esports', icon: 'football' as const },
    { id: 'gratuït', label: 'Gratuït', icon: 'pricetag' as const },
    { id: 'pagament', label: 'Pagament', icon: 'card' as const },
    { id: 'centre', label: 'Centre', icon: 'location' as const },
    { id: 'gràcia', label: 'Gràcia', icon: 'map' as const },
  ];

  const handleFilterPress = (filterId: React.SetStateAction<string>) => {
    setActiveFilter(activeFilter === filterId ? '' : filterId);
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor='transparent' />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 41.3851,
          longitude: 2.1734,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name='search'
            size={24}
            color='#666'
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder='Cerca esdeveniments...'
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor='#999'
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={toggleFilterModal}
          >
            <Ionicons name='options-outline' size={24} color='#666' />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterPress(filter.id)}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={activeFilter === filter.id ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Modal
        animationType='slide'
        transparent={true}
        visible={filterModalVisible}
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

            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.filterGridContainer}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterGridItem,
                    activeFilter === filter.id && styles.filterButtonActive,
                  ]}
                  onPress={() => handleFilterPress(filter.id)}
                >
                  <Ionicons
                    name={filter.icon}
                    size={24}
                    color={activeFilter === filter.id ? '#fff' : '#666'}
                  />
                  <Text
                    style={[
                      styles.filterGridText,
                      activeFilter === filter.id && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={toggleFilterModal}
            >
              <Text style={styles.applyButtonText}>Aplicar filtres</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  applyButton: {
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 10,
    marginTop: 40,
    paddingVertical: 15,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  filterButton: {
    padding: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4285F4',
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 2,
    flexDirection: 'row',
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  filterGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterGridItem: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    width: '30%',
  },
  filterGridText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  filterTextActive: {
    color: '#fff',
  },
  filtersScrollContainer: {
    paddingVertical: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '60%',
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
  },
  modalTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 28,
    elevation: 4,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: '100%',
  },
  searchContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 30,
    width: '100%',
    zIndex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 5,
  },
});
