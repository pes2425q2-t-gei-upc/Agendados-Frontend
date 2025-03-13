import { Ionicons } from '@expo/vector-icons';
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
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Define types for our filter items with proper Ionicons typing
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

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  // Replace single activeFilter with a set of active filters
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);

  // Date range state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Location state
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const mapRef = useRef<MapView | null>(null);

  // Añadir estados para los desplegables de población
  const [populationDropdownVisible, setPopulationDropdownVisible] =
    useState(false);
  const [selectedPopulation, setSelectedPopulation] = useState<string | null>(
    null
  );

  // Request location permission on component mount
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
        // If permission granted, automatically get location once
        getUserLocation();
      }
    })();
  }, []);

  const getUserLocation = async () => {
    if (!locationPermission) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación denegado',
          'No podrás ver tu ubicación actual en el mapa sin este permiso.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const userCoords = { latitude, longitude };
      setUserLocation(userCoords);

      // Animate map to user location
      mapRef.current?.animateToRegion(
        {
          ...userCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    } catch (err) {
      console.error('Error getting location:', err);
      Alert.alert(
        'Error al obtener ubicación',
        'No se pudo obtener tu ubicación actual. Inténtalo de nuevo más tarde.',
        [{ text: 'OK' }]
      );
    }
  };

  const markers = [
    {
      id: 1,
      coordinate: { latitude: 41.3851, longitude: 2.1734 },
      title: 'Esdeveniment 1',
      description: 'esports - centre - gratuït',
      image: 'https://picsum.photos/200/200?random=1',
      date: '15 May',
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
    {
      id: 3,
      coordinate: { latitude: 41.3811, longitude: 2.1694 },
      title: 'Esdeveniment 3',
      description: 'esports - gràcia - pagament',
      image: 'https://picsum.photos/200/200?random=3',
      date: '22 May',
      time: '10:00',
      category: 'esports',
      location: 'gràcia',
    },
    {
      id: 4,
      coordinate: { latitude: 41.3921, longitude: 2.1804 },
      title: 'Esdeveniment 4',
      description: 'cultura - centre - gratuït',
      image: 'https://picsum.photos/200/200?random=4',
      date: '25 May',
      time: '17:15',
      category: 'cultura',
      location: 'centre',
    },
  ];

  // Group filters by type
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

  // Lista de poblaciones para el dropdown
  const populationList = [
    { id: 'barcelona', label: 'Barcelona' },
    { id: 'girona', label: 'Girona' },
    { id: 'lleida', label: 'Lleida' },
    { id: 'tarragona', label: 'Tarragona' },
    { id: 'sabadell', label: 'Sabadell' },
    { id: 'terrassa', label: 'Terrassa' },
    { id: 'badalona', label: 'Badalona' },
    { id: 'reus', label: 'Reus' },
    { id: 'hospitalet', label: "L'Hospitalet de Llobregat" },
    { id: 'mataro', label: 'Mataró' },
    { id: 'manresa', label: 'Manresa' },
    { id: 'figueres', label: 'Figueres' },
    { id: 'vic', label: 'Vic' },
    { id: 'sitges', label: 'Sitges' },
    { id: 'castelldefels', label: 'Castelldefels' },
    { id: 'granollers', label: 'Granollers' },
  ];

  // Flat list of all filters for quick access
  const allFilters: FilterItem[] = filterCategories.flatMap(
    (category) => category.items
  );

  // Handle toggling a filter (now adds/removes from a Set)
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

  const handleStartDateChange = (selectedDate: Date) => {
    setShowStartDatePicker(false);
    setStartDate(selectedDate);
  };

  const handleEndDateChange = (selectedDate: Date) => {
    setShowEndDatePicker(false);
    setEndDate(selectedDate);
  };

  const formatDate = (date: Date | null) => {
    if (!date) {
      return 'Seleccionar';
    }
    return date.toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Función para seleccionar una población
  const handlePopulationSelect = (populationId: string) => {
    setSelectedPopulation(populationId);
    setPopulationDropdownVisible(false);

    // Añadir al conjunto de filtros activos
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);

      // Primero eliminar cualquier población que estuviera seleccionada
      populationList.forEach((pop) => {
        if (newFilters.has(pop.id)) {
          newFilters.delete(pop.id);
        }
      });

      // Añadir la nueva población seleccionada
      newFilters.add(populationId);
      return newFilters;
    });
  };

  // Función para mostrar/ocultar el dropdown de población
  const togglePopulationDropdown = () => {
    setPopulationDropdownVisible(!populationDropdownVisible);
  };

  const clearFilters = () => {
    setActiveFilters(new Set());
    setStartDate(null);
    setEndDate(null);
    setSelectedPopulation(null);
  };

  // Filter markers based on active filters
  const filteredMarkers = markers.filter((marker) => {
    // Si no hay filtros activos (y tampoco se ha seleccionado rango de fechas), mostramos todos los marcadores
    if (activeFilters.size === 0 && !startDate && !endDate) {
      return true;
    }

    // Por ahora, filtramos únicamente por categoría
    return activeFilters.has(marker.category);
  });

  // Get closest events based on user location
  const getNearbyEvents = () => {
    if (!userLocation) {
      return filteredMarkers;
    }

    // Simple distance calculation to find nearby events
    // Could be improved with more sophisticated distance calculation
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

  // Simplificar el selector de fechas para hacerlo más funcional
  const renderDatePicker = (
    visible: boolean,
    currentDate: Date | null,
    onDateChange: (date: Date) => void
  ) => {
    if (!visible) {
      return null;
    }

    // Lista de meses para mostrar
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    return (
      <Modal
        transparent={true}
        animationType='slide'
        visible={visible}
        onRequestClose={() => {
          if (visible === showStartDatePicker) {
            setShowStartDatePicker(false);
          } else {
            setShowEndDatePicker(false);
          }
        }}
      >
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Seleccionar data</Text>
              <TouchableOpacity
                onPress={() => {
                  if (visible === showStartDatePicker) {
                    setShowStartDatePicker(false);
                  } else {
                    setShowEndDatePicker(false);
                  }
                }}
              >
                <Ionicons name='close' size={24} color='#333' />
              </TouchableOpacity>
            </View>

            <View style={styles.simpleDatePickerContainer}>
              {/* Lista de opciones simplificadas */}
              <ScrollView style={styles.dateOptionsList}>
                <TouchableOpacity
                  style={styles.dateOption}
                  onPress={() => {
                    onDateChange(new Date());
                  }}
                >
                  <Text style={styles.dateOptionText}>Hoy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateOption}
                  onPress={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    onDateChange(tomorrow);
                  }}
                >
                  <Text style={styles.dateOptionText}>Mañana</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateOption}
                  onPress={() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    onDateChange(nextWeek);
                  }}
                >
                  <Text style={styles.dateOptionText}>Próxima semana</Text>
                </TouchableOpacity>

                <Text style={styles.dateOptionSeparator}>Este mes</Text>

                {/* Generar opciones para cada día del mes actual */}
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  // Verificar si el día es válido para el mes actual
                  const date = new Date(currentYear, currentMonth, day);
                  if (date.getMonth() !== currentMonth) {
                    return null;
                  }

                  return (
                    <TouchableOpacity
                      key={`this-month-${day}`}
                      style={styles.dateOption}
                      onPress={() => {
                        onDateChange(date);
                      }}
                    >
                      <Text style={styles.dateOptionText}>
                        {day} de {months[currentMonth]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <Text style={styles.dateOptionSeparator}>Próximo mes</Text>

                {/* Generar opciones para cada día del próximo mes */}
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const nextMonth =
                    currentMonth + 1 > 11 ? 0 : currentMonth + 1;
                  const year = nextMonth === 0 ? currentYear + 1 : currentYear;

                  // Verificar si el día es válido para el próximo mes
                  const date = new Date(year, nextMonth, day);
                  if (date.getMonth() !== nextMonth) {
                    return null;
                  }

                  return (
                    <TouchableOpacity
                      key={`next-month-${day}`}
                      style={styles.dateOption}
                      onPress={() => {
                        onDateChange(date);
                      }}
                    >
                      <Text style={styles.dateOptionText}>
                        {day} de {months[nextMonth]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    );
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

      {/* My location button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={getUserLocation}
      >
        <Ionicons name='locate' size={24} color='#4285F4' />
      </TouchableOpacity>

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

          {/* Show date range if selected */}
          {(startDate ?? endDate) && (
            <View style={styles.dateRangeChip}>
              <Ionicons name='calendar' size={16} color='#666' />
              <Text style={styles.filterText}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
          )}

          {/* Show active filters as chips */}
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

      {/* Horizontal scrollable events */}
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
                // You could navigate to event details or show more info here
                //console.log(`Event ${event.id} pressed`);
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

      {/* Botón para mostrar el desplegable de eventos */}
      <TouchableOpacity style={styles.eventsButton} onPress={toggleEventsModal}>
        <Text style={styles.eventsButtonText}>Tots els esdeveniments</Text>
      </TouchableOpacity>

      {/* Date picker modals */}
      {renderDatePicker(showStartDatePicker, startDate, handleStartDateChange)}
      {renderDatePicker(showEndDatePicker, endDate, handleEndDateChange)}

      {/* Modal de personalización de búsqueda */}
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

            {/* Date range section */}
            <Text style={styles.sectionTitle}>Rang de dates</Text>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons name='calendar-outline' size={20} color='#666' />
                <Text style={styles.datePickerButtonText}>
                  {startDate ? formatDate(startDate) : 'Data inici'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.dateRangeSeparator}>-</Text>

              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name='calendar-outline' size={20} color='#666' />
                <Text style={styles.datePickerButtonText}>
                  {endDate ? formatDate(endDate) : 'Data fi'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Categorized filter sections */}
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

            {/* Sección de población con desplegable */}
            <View>
              <Text style={styles.sectionTitle}>Població</Text>
              <TouchableOpacity
                style={styles.populationDropdownButton}
                onPress={togglePopulationDropdown}
              >
                <Text style={styles.populationDropdownButtonText}>
                  {selectedPopulation
                    ? (populationList.find((p) => p.id === selectedPopulation)
                        ?.label ?? 'Seleccionar población')
                    : 'Seleccionar población'}
                </Text>
                <Ionicons name='chevron-down' size={20} color='#666' />
              </TouchableOpacity>

              {/* Modal de dropdown para seleccionar población */}
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

                    <ScrollView style={styles.populationList}>
                      {populationList.map((population) => (
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

      {/* Modal de esdeveniments */}
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
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventModalCard}
                  onPress={() => {
                    // Acción al pulsar sobre el evento
                    console.log(`Event ${event.id} pressed`);
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

const styles = StyleSheet.create({
  applyButton: {
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    paddingVertical: 15,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
    paddingVertical: 15,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  clearFilterChip: {
    alignItems: 'center',
    backgroundColor: '#f44336',
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
  clearFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  container: {
    flex: 1,
  },
  datePickerButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePickerButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    padding: 20,
    position: 'absolute',
    width: '100%',
  },
  datePickerHeader: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
  },
  datePickerModal: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateRangeChip: {
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    borderColor: '#4285F4',
    borderRadius: 20,
    borderWidth: 1,
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
  dateRangeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateRangeSeparator: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 220,
  },
  eventCardContent: {
    padding: 12,
  },
  eventCardDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  eventCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventCardTime: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  eventCardTimeText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  eventCardTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDescription: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  eventImage: {
    height: 100,
    width: '100%',
  },
  eventTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventsButton: {
    alignSelf: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 25,
    bottom: 20,
    elevation: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    position: 'absolute',
  },
  eventsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventsModalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  eventsModalContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'flex-end',
    maxHeight: '85%',
    padding: 20,
  },
  eventsModalHeader: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
  },
  eventsModalTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterActionsContainer: {
    flexDirection: 'row',
    marginTop: 30,
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
    marginBottom: 15,
  },
  filterGridItem: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    width: '23%',
  },
  filterGridText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
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
    marginTop: 10,
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
    maxHeight: '80%',
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
  myLocationButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 28,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    top: 130,
    width: 56,
    zIndex: 1,
  },
  nearbyEventsContainer: {
    bottom: 80,
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
  },
  nearbyEventsScrollContainer: {
    paddingBottom: 10,
  },
  // eslint-disable-next-line react-native/sort-styles
  dropdownOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  populationDropdownButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 12,
  },
  populationDropdownButtonText: {
    color: '#333',
    fontSize: 16,
  },
  populationDropdownContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%', // ahora ocupa el 80% de la pantalla
    padding: 20,
  },
  populationDropdownHeader: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
  },
  populationDropdownTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  populationList: {
    maxHeight: 400,
  },
  populationListItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  populationListItemSelected: {
    backgroundColor: '#4285F4',
  },
  populationListItemText: {
    color: '#333',
    fontSize: 16,
  },
  populationListItemTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  removeFilterIcon: {
    marginLeft: 6,
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
  // Estilos para el selector de fechas simplificado
  simpleDatePickerContainer: {
    marginVertical: 10,
  },
  dateOptionsList: {
    maxHeight: 350,
  },
  dateOption: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateOptionText: {
    color: '#333',
    fontSize: 16,
  },
  dateOptionSeparator: {
    backgroundColor: '#f5f5f5',
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  eventModalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 10, // Space between cards in the modal
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 220,
  },
  /* eslint-enable sort-keys */
});

export { Explore };
