import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
  Image,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { styles } from '../../styles/Explore';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type FilterItem = {
  id: string;
  label: string;
  icon: IconName;
};

type LocationCoords = {
  latitude: number;
  longitude: number;
};

function parseMarkerDate(dateString: string): Date {
  // Tus markers tienen formato "15 May".
  // Asignamos un año fijo, por ejemplo, 2023
  return new Date(`${dateString} 2023`);
}

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);

  // Estados para el rango de fechas
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Estados para DateTimePicker
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentMode, setCurrentMode] = useState<'start' | 'end'>('start');
  const [datePickerDate, setDatePickerDate] = useState(new Date());

  // Ubicación
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const mapRef = useRef<MapView | null>(null);

  // Estado población
  const [populationDropdownVisible, setPopulationDropdownVisible] =
    useState(false);
  const [selectedPopulation, setSelectedPopulation] = useState<string | null>(
    null
  );

  // Pides permiso ubicación al montar
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación denegado',
          'No podrás ver tu ubicación actual en el mapa sin este permiso.',
          [{ text: 'OK' }]
        );
      } else {
        getUserLocation();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLocation = async () => {
    if (!locationPermission) {
      // ...
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      const userCoords = { latitude, longitude };
      setUserLocation(userCoords);

      mapRef.current?.animateToRegion(
        {
          ...userCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // ...
    }
  };

  // Marcadores de ejemplo
  const markers = [
    {
      id: 1,
      coordinate: { latitude: 41.3851, longitude: 2.1734 },
      title: 'Esdeveniment 1',
      description: 'esports - centre - gratuït',
      image: 'https://picsum.photos/200/200?random=1',
      date: '15 May', // Sin año => parseMarkerDate("15 May") => 15 May 2023
      time: '18:30',
      category: 'esports',
      location: 'centre',
    },
    {
      id: 2,
      coordinate: { latitude: 41.3891, longitude: 2.1654 },
      title: 'Esdeveniment 2',
      description: 'cultura - eixample - pagament',
      image: 'https://picsum.photos/200/200?random=2',
      date: '20 May',
      time: '19:00',
      category: 'cultura',
      location: 'eixample',
    },
    // ...
  ];

  // Categorías
  const filterCategories = [
    {
      title: 'Categoria',
      items: [
        { id: 'cultura', label: 'Cultura', icon: 'color-palette' },
        { id: 'esports', label: 'Esports', icon: 'football' },
        { id: 'música', label: 'Música', icon: 'musical-notes' },
        { id: 'art', label: 'Art', icon: 'brush' },
      ] as FilterItem[],
    },
  ];

  // Lista de poblaciones
  const populationList = [
    { id: 'barcelona', label: 'Barcelona' },
    { id: 'girona', label: 'Girona' },
    { id: 'lleida', label: 'Lleida' },
    { id: 'tarragona', label: 'Tarragona' },
    // ...
  ];

  // Flat list de filtros
  const allFilters: FilterItem[] = filterCategories.flatMap(
    (category) => category.items
  );

  // Manejo de toggles
  const handleFilterPress = (filterId: string) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId);
      } else {
        newFilters.add(filterId);
      }
      return newFilters;
    });
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  const toggleEventsModal = () => {
    setEventsModalVisible(!eventsModalVisible);
  };

  // Funciones mejoradas para el DateTimePicker
  const openDatePicker = (mode: 'start' | 'end') => {
    setCurrentMode(mode);
    setDatePickerDate(
      mode === 'start' ? (startDate ?? new Date()) : (endDate ?? new Date())
    );

    if (Platform.OS === 'ios') {
      // En iOS usamos el modal
      setShowStartDatePicker(mode === 'start');
      setShowEndDatePicker(mode === 'end');
    } else {
      // En Android mostramos el selector nativo
      if (mode === 'start') {
        setShowStartDatePicker(true);
      } else {
        setShowEndDatePicker(true);
      }
    }
  };

  const onDateChange = (event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }

    if (selectedDate) {
      if (currentMode === 'start') {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) {
      return currentMode === 'start' ? 'Data inici' : 'Data fi';
    }
    return date.toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getFilteredPopulations = () => {
    if (!populationSearchQuery.trim()) {
      return populationList;
    }
    return populationList.filter((item) =>
      item.label.toLowerCase().includes(populationSearchQuery.toLowerCase())
    );
  };

  // Función para seleccionar población
  const handlePopulationSelect = (populationId: string) => {
    setSelectedPopulation(populationId);
    setPopulationDropdownVisible(false);
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      populationList.forEach((pop) => {
        if (newFilters.has(pop.id)) {
          newFilters.delete(pop.id);
        }
      });
      newFilters.add(populationId);
      return newFilters;
    });
  };

  const togglePopulationDropdown = () => {
    setPopulationDropdownVisible(!populationDropdownVisible);
  };

  const clearFilters = () => {
    setActiveFilters(new Set());
    setStartDate(null);
    setEndDate(null);
    setSelectedPopulation(null);
  };
  const [populationSearchQuery, setPopulationSearchQuery] = useState('');

  // Filtrar marcadores por fecha + categorías
  const filteredMarkers = markers.filter((marker) => {
    const markerDate = parseMarkerDate(marker.date);

    if (startDate && markerDate < startDate) {
      return false;
    }

    if (endDate && markerDate > endDate) {
      return false;
    }

    if (activeFilters.size > 0 && !activeFilters.has(marker.category)) {
      return false;
    }

    return true;
  });

  // Eventos cercanos
  const getNearbyEvents = () => {
    if (!userLocation) {
      return filteredMarkers;
    }
    return filteredMarkers.sort((a, b) => {
      const distA = Math.sqrt(
        Math.pow(a.coordinate.latitude - userLocation.latitude, 2) +
          Math.pow(a.coordinate.longitude - userLocation.longitude, 2)
      );
      const distB = Math.sqrt(
        Math.pow(b.coordinate.latitude - userLocation.latitude, 2) +
          Math.pow(b.coordinate.longitude - userLocation.longitude, 2)
      );
      return distA - distB;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor='transparent' />

      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: 41.3851,
          longitude: 2.1734,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {filteredMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>

      {/* Botón: Mi ubicación */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={getUserLocation}
      >
        <Ionicons name='locate' size={24} color='#4285F4' />
      </TouchableOpacity>

      {/* Barra de búsqueda */}
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
          {activeFilters.size > 0 && (
            <TouchableOpacity
              style={styles.clearFilterChip}
              onPress={clearFilters}
            >
              <Ionicons name='close-circle' size={16} color='#fff' />
              <Text style={styles.clearFilterText}>Esborrar filtres</Text>
            </TouchableOpacity>
          )}

          {/* Rango de fechas seleccionado */}
          {(startDate ?? endDate) && (
            <View style={styles.dateRangeChip}>
              <Ionicons name='calendar' size={16} color='#666' />
              <Text style={styles.filterText}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
          )}

          {/* Mostrar chips de filtros activos */}
          {Array.from(activeFilters).map((filterId) => {
            const filter = allFilters.find((f) => f.id === filterId);
            if (!filter) {
              return null;
            }

            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, styles.filterButtonActive]}
                onPress={() => handleFilterPress(filter.id)}
              >
                <Ionicons name={filter.icon} size={16} color='#fff' />
                <Text style={[styles.filterText, styles.filterTextActive]}>
                  {filter.label}
                </Text>
                <Ionicons
                  name='close-circle'
                  size={14}
                  color='#fff'
                  style={styles.removeFilterIcon}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Scroll horizontal de eventos cercanos */}
      <View style={styles.nearbyEventsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nearbyEventsScrollContainer}
        >
          {getNearbyEvents().map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => {
                // ...
              }}
            >
              <Image
                source={{ uri: event.image }}
                style={styles.eventImage}
                resizeMode='cover'
              />
              <View style={styles.eventCardContent}>
                <Text style={styles.eventCardTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.eventCardDescription} numberOfLines={1}>
                  {event.description}
                </Text>
                <View style={styles.eventCardFooter}>
                  <View style={styles.eventCardTime}>
                    <Ionicons name='calendar-outline' size={12} color='#666' />
                    <Text style={styles.eventCardTimeText}>{event.date}</Text>
                  </View>
                  <View style={styles.eventCardTime}>
                    <Ionicons name='time-outline' size={12} color='#666' />
                    <Text style={styles.eventCardTimeText}>{event.time}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Botón para mostrar el modal de eventos */}
      <TouchableOpacity style={styles.eventsButton} onPress={toggleEventsModal}>
        <Text style={styles.eventsButtonText}>Tots els esdeveniments</Text>
      </TouchableOpacity>

      {/* Modal para personalizar filtros */}
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

            {/* Rango de fechas - Mejorado */}
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

            {/* DateTimePicker para Android (aparece como un popup) */}
            {Platform.OS === 'android' &&
              (showStartDatePicker || showEndDatePicker) && (
                <DateTimePicker
                  value={datePickerDate}
                  mode='date'
                  display='default'
                  onChange={onDateChange}
                />
              )}

            {/* Modal para DateTimePicker en iOS */}
            {Platform.OS === 'ios' && (
              <Modal
                transparent={true}
                animationType='slide'
                visible={showStartDatePicker || showEndDatePicker}
                onRequestClose={() => {
                  setShowStartDatePicker(false);
                  setShowEndDatePicker(false);
                }}
              >
                <TouchableOpacity
                  style={datePickerStyles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => {
                    setShowStartDatePicker(false);
                    setShowEndDatePicker(false);
                  }}
                >
                  <View style={datePickerStyles.datePickerContainer}>
                    <View style={datePickerStyles.datePickerHeader}>
                      <Text style={datePickerStyles.datePickerTitle}>
                        {currentMode === 'start'
                          ? 'Seleccionar data inici'
                          : 'Seleccionar data fi'}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowStartDatePicker(false);
                          setShowEndDatePicker(false);
                        }}
                      >
                        <Ionicons name='close' size={24} color='#333' />
                      </TouchableOpacity>
                    </View>

                    <DateTimePicker
                      value={datePickerDate}
                      mode='date'
                      display='spinner'
                      onChange={onDateChange}
                      style={datePickerStyles.iosDatePicker}
                    />

                    <View style={datePickerStyles.datePickerActions}>
                      <TouchableOpacity
                        style={datePickerStyles.cancelButton}
                        onPress={() => {
                          setShowStartDatePicker(false);
                          setShowEndDatePicker(false);
                        }}
                      >
                        <Text style={datePickerStyles.cancelButtonText}>
                          Cancel·lar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={datePickerStyles.confirmButton}
                        onPress={() => {
                          if (currentMode === 'start') {
                            setStartDate(datePickerDate);
                          } else {
                            setEndDate(datePickerDate);
                          }
                          setShowStartDatePicker(false);
                          setShowEndDatePicker(false);
                        }}
                      >
                        <Text style={datePickerStyles.confirmButtonText}>
                          Confirmar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Modal>
            )}

            {/* Secciones de categoría */}
            {filterCategories.map((category, index) => (
              <View key={index}>
                <Text style={styles.sectionTitle}>{category.title}</Text>
                <View style={styles.filterGridContainer}>
                  {category.items.map((filter) => (
                    <TouchableOpacity
                      key={filter.id}
                      style={[
                        styles.filterGridItem,
                        activeFilters.has(filter.id) &&
                          styles.filterButtonActive,
                      ]}
                      onPress={() => handleFilterPress(filter.id)}
                    >
                      <Ionicons
                        name={filter.icon}
                        size={24}
                        color={activeFilters.has(filter.id) ? '#fff' : '#666'}
                      />
                      <Text
                        style={[
                          styles.filterGridText,
                          activeFilters.has(filter.id) &&
                            styles.filterTextActive,
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {/* Población */}
            <View>
              <Text style={styles.sectionTitle}>Població</Text>
              <TouchableOpacity
                style={styles.populationDropdownButton}
                onPress={togglePopulationDropdown}
              >
                <Text style={styles.populationDropdownButtonText}>
                  {selectedPopulation
                    ? (populationList.find((p) => p.id === selectedPopulation)
                        ?.label ?? 'Seleccionar població')
                    : 'Seleccionar població'}
                </Text>
                <Ionicons name='chevron-down' size={20} color='#666' />
              </TouchableOpacity>

              {/* Modal de dropdown poblaciones con búsqueda predictiva */}
              <Modal
                transparent={true}
                animationType='slide'
                visible={populationDropdownVisible}
                onRequestClose={() => setPopulationDropdownVisible(false)}
              >
                <TouchableOpacity
                  style={styles.dropdownOverlay}
                  activeOpacity={1}
                  onPress={() => setPopulationDropdownVisible(false)}
                >
                  <View style={styles.populationDropdownContainer}>
                    <View style={styles.populationDropdownHeader}>
                      <Text style={styles.populationDropdownTitle}>
                        Seleccionar població
                      </Text>
                      <TouchableOpacity
                        onPress={() => setPopulationDropdownVisible(false)}
                      >
                        <Ionicons name='close' size={24} color='#333' />
                      </TouchableOpacity>
                    </View>

                    {/* Buscador predictivo */}
                    <View style={styles.searchPopulationContainer}>
                      <Ionicons
                        name='search'
                        size={20}
                        color='#666'
                        style={styles.searchPopulationIcon}
                      />
                      <TextInput
                        style={styles.searchPopulationInput}
                        placeholder='Cerca població...'
                        value={populationSearchQuery}
                        onChangeText={setPopulationSearchQuery}
                        autoCapitalize='none'
                        autoCorrect={false}
                      />
                      {populationSearchQuery ? (
                        <TouchableOpacity
                          onPress={() => setPopulationSearchQuery('')}
                          style={styles.clearSearchButton}
                        >
                          <Ionicons
                            name='close-circle'
                            size={16}
                            color='#666'
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <ScrollView style={styles.populationList}>
                      {getFilteredPopulations().map((population) => (
                        <TouchableOpacity
                          key={population.id}
                          style={[
                            styles.populationListItem,
                            selectedPopulation === population.id &&
                              styles.populationListItemSelected,
                          ]}
                          onPress={() => handlePopulationSelect(population.id)}
                        >
                          <Text
                            style={[
                              styles.populationListItemText,
                              selectedPopulation === population.id &&
                                styles.populationListItemTextSelected,
                            ]}
                          >
                            {population.label}
                          </Text>
                          {selectedPopulation === population.id && (
                            <Ionicons name='checkmark' size={20} color='#fff' />
                          )}
                        </TouchableOpacity>
                      ))}
                      {getFilteredPopulations().length === 0 && (
                        <View style={styles.noResultsContainer}>
                          <Text style={styles.noResultsText}>
                            No s&apos;han trobat resultats
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            <View style={styles.filterActionsContainer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
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

      {/* Modal de eventos */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={eventsModalVisible}
        onRequestClose={toggleEventsModal}
      >
        <View style={styles.eventsModalContainer}>
          <View style={styles.eventsModalContent}>
            <View style={styles.eventsModalHeader}>
              <Text style={styles.eventsModalTitle}>Esdeveniments</Text>
              <TouchableOpacity onPress={toggleEventsModal}>
                <Ionicons name='close' size={24} color='#333' />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {filteredMarkers.map((event) => (
                <TouchableOpacity key={event.id} style={styles.eventModalCard}>
                  <Image
                    source={{ uri: event.image }}
                    style={styles.eventImage}
                    resizeMode='cover'
                  />
                  <View style={styles.eventCardContent}>
                    <Text style={styles.eventCardTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventCardDescription} numberOfLines={1}>
                      {event.description}
                    </Text>
                    <View style={styles.eventCardFooter}>
                      <View style={styles.eventCardTime}>
                        <Ionicons
                          name='calendar-outline'
                          size={12}
                          color='#666'
                        />
                        <Text style={styles.eventCardTimeText}>
                          {event.date}
                        </Text>
                      </View>
                      <View style={styles.eventCardTime}>
                        <Ionicons name='time-outline' size={12} color='#666' />
                        <Text style={styles.eventCardTimeText}>
                          {event.time}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos adicionales para el DatePicker
const datePickerStyles = StyleSheet.create({
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 20,
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  datePickerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePickerTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iosDatePicker: {
    height: 200,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
});
