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
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

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
    { id: 'cultura', label: 'Cultura', icon: 'color-palette' },
    { id: 'esports', label: 'Esports', icon: 'football' },
    { id: 'gratuït', label: 'Gratuït', icon: 'pricetag' },
    { id: 'pagament', label: 'Pagament', icon: 'card' },
    { id: 'centre', label: 'Centre', icon: 'location' },
    { id: 'gràcia', label: 'Gràcia', icon: 'map' },
  ];

  const handleFilterPress = (filterId: React.SetStateAction<string>) => {
    setActiveFilter(activeFilter === filterId ? '' : filterId);
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
                styles.filterButton,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterButton: {
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
  filterButtonActive: {
    backgroundColor: '#4285F4',
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
});
