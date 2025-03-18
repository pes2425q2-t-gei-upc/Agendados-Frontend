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

// Tipos
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

type MarkerData = {
  id: number;
  coordinate: LocationCoords;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  category: string;
  location: string;
};

type PopulationItem = {
  id: string;
  label: string;
};

type FilterCategory = {
  title: string;
  items: FilterItem[];
};

// Constantes
const INITIAL_REGION = {
  latitude: 41.3851,
  longitude: 2.1734,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Componentes auxiliares
const DatePickerModal = ({
  visible,
  onClose,
  currentMode,
  datePickerDate,
  onDateChange,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  currentMode: 'start' | 'end';
  datePickerDate: Date;
  onDateChange: (event: any, date?: Date) => void;
  onConfirm: () => void;
}) => {
  return (
    <Modal
      transparent={true}
      animationType='slide'
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={datePickerStyles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={datePickerStyles.datePickerContainer}>
          <View style={datePickerStyles.datePickerHeader}>
            <Text style={datePickerStyles.datePickerTitle}>
              {currentMode === 'start'
                ? 'Seleccionar data inici'
                : 'Seleccionar data fi'}
            </Text>
            <TouchableOpacity onPress={onClose}>
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
              onPress={onClose}
            >
              <Text style={datePickerStyles.cancelButtonText}>Cancel·lar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={datePickerStyles.confirmButton}
              onPress={onConfirm}
            >
              <Text style={datePickerStyles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

type PopulationSelectorProps = {
  visible: boolean;
  onClose: () => void;
  selectedPopulation: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  populations: PopulationItem[];
  onSelect: (populationId: string) => void;
};

const PopulationSelector = ({
  visible,
  onClose,
  selectedPopulation,
  searchQuery,
  setSearchQuery,
  populations,
  onSelect,
}: PopulationSelectorProps) => {
  const getFilteredPopulations = () => {
    if (!searchQuery.trim()) {
      return populations;
    }
    return populations.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredPopulations = getFilteredPopulations();

  return (
    <Modal
      transparent={true}
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
              Seleccionar població
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
              placeholder='Cerca població...'
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize='none'
              autoCorrect={false}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Ionicons name='close-circle' size={16} color='#666' />
              </TouchableOpacity>
            ) : null}
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
                  No s&apos;han trobat resultats
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const EventCard = ({
  event,
  onPress,
}: {
  event: MarkerData;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.eventCard} onPress={onPress}>
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
);

// Helpers
function parseMarkerDate(dateString: string): Date {
  return new Date(`${dateString} 2023`);
}

// Componente principal
export default function Explore() {
  // Estado de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // Estado para modales
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [populationDropdownVisible, setPopulationDropdownVisible] =
    useState(false);

  // Estados para fechas
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentMode, setCurrentMode] = useState<'start' | 'end'>('start');
  const [datePickerDate, setDatePickerDate] = useState(new Date());

  // Estados para ubicación
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const mapRef = useRef<MapView | null>(null);

  // Estado para poblaciones
  const [selectedPopulation, setSelectedPopulation] = useState<string | null>(
    null
  );
  const [populationSearchQuery, setPopulationSearchQuery] = useState('');

  // Datos
  const filterCategories: FilterCategory[] = [
    {
      title: 'Categoria',
      items: [
        { id: 'cultura', label: 'Cultura', icon: 'color-palette' },
        { id: 'esports', label: 'Esports', icon: 'football' },
        { id: 'música', label: 'Música', icon: 'musical-notes' },
        { id: 'art', label: 'Art', icon: 'brush' },
      ],
    },
  ];

  const populationList: PopulationItem[] = [
    { id: 'barcelona', label: 'Barcelona' },
    { id: 'girona', label: 'Girona' },
    { id: 'lleida', label: 'Lleida' },
    { id: 'tarragona', label: 'Tarragona' },
    { id: 'sabadell', label: 'Sabadell' },
    { id: 'terrassa', label: 'Terrassa' },
    { id: 'hospitalet', label: "L'Hospitalet de Llobregat" },
    { id: 'badalona', label: 'Badalona' },
    { id: 'mataro', label: 'Mataró' },
    { id: 'santcugat', label: 'Sant Cugat' },
    { id: 'granollers', label: 'Granollers' },
    { id: 'reus', label: 'Reus' },
    { id: 'sitges', label: 'Sitges' },
    { id: 'figueres', label: 'Figueres' },
    { id: 'manresa', label: 'Manresa' },
    { id: 'vic', label: 'Vic' },
  ];

  const markers: MarkerData[] = [
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
  ];

  // Efectos
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Handlers
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const hasPermission = status === 'granted';
    setLocationPermission(hasPermission);

    if (!hasPermission) {
      Alert.alert(
        'Permiso de ubicación denegado',
        'No podrás ver tu ubicación actual en el mapa sin este permiso.',
        [{ text: 'OK' }]
      );
      return;
    }

    getUserLocation();
  };

  const getUserLocation = async () => {
    if (!locationPermission) {
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
    } catch (error) {
      // Puedes manejar el error aquí si lo necesitas
    }
  };

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

  const openDatePicker = (mode: 'start' | 'end') => {
    setCurrentMode(mode);
    setDatePickerDate(
      mode === 'start' ? (startDate ?? new Date()) : (endDate ?? new Date())
    );

    if (Platform.OS === 'ios') {
      setShowStartDatePicker(mode === 'start');
      setShowEndDatePicker(mode === 'end');
    } else {
      if (mode === 'start') {
        setShowStartDatePicker(true);
      } else {
        setShowEndDatePicker(true);
      }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
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

  const handleDatePickerConfirm = () => {
    if (currentMode === 'start') {
      setStartDate(datePickerDate);
    } else {
      setEndDate(datePickerDate);
    }
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

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

  const clearFilters = () => {
    setActiveFilters(new Set());
    setStartDate(null);
    setEndDate(null);
    setSelectedPopulation(null);
  };

  const closeDatePicker = () => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  // Utilidades
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

  // Procesamiento de datos
  const allFilters: FilterItem[] = filterCategories.flatMap(
    (category) => category.items
  );

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

  const getNearbyEvents = () => {
    if (!userLocation) {
      return filteredMarkers;
    }

    return [...filteredMarkers].sort((a, b) => {
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

  // Renderizado
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor='transparent' />

      {/* Mapa con marcadores */}
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        initialRegion={INITIAL_REGION}
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

      {/* Botón de ubicación */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={getUserLocation}
      >
        <Ionicons name='locate' size={24} color='#4285F4' />
      </TouchableOpacity>

      {/* Barra de búsqueda y filtros */}
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

        {/* Chips de filtros activos */}
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

          {(startDate ?? endDate) && (
            <View style={styles.dateRangeChip}>
              <Ionicons name='calendar' size={16} color='#666' />
              <Text style={styles.filterText}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
          )}

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

      {/* Eventos cercanos */}
      <View style={styles.nearbyEventsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nearbyEventsScrollContainer}
        >
          {getNearbyEvents().map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => {
                /* Navegación al detalle del evento */
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Botón para mostrar todos los eventos */}
      <TouchableOpacity style={styles.eventsButton} onPress={toggleEventsModal}>
        <Text style={styles.eventsButtonText}>Tots els esdeveniments</Text>
      </TouchableOpacity>

      {/* Modales */}
      {/* Modal de filtros */}
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

            {/* Selector de fechas */}
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

            {/* DateTimePicker para Android */}
            {Platform.OS === 'android' &&
              (showStartDatePicker || showEndDatePicker) && (
                <DateTimePicker
                  value={datePickerDate}
                  mode='date'
                  display='default'
                  onChange={onDateChange}
                />
              )}

            {/* DateTimePicker para iOS */}
            {Platform.OS === 'ios' && (
              <DatePickerModal
                visible={showStartDatePicker || showEndDatePicker}
                onClose={closeDatePicker}
                currentMode={currentMode}
                datePickerDate={datePickerDate}
                onDateChange={onDateChange}
                onConfirm={handleDatePickerConfirm}
              />
            )}

            {/* Filtros por categoría */}
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

            {/* Selector de población */}
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

            {/* Botones de acción */}
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

      {/* Modal selector de población */}
      <PopulationSelector
        visible={populationDropdownVisible}
        onClose={() => setPopulationDropdownVisible(false)}
        selectedPopulation={selectedPopulation}
        searchQuery={populationSearchQuery}
        setSearchQuery={setPopulationSearchQuery}
        populations={populationList}
        onSelect={handlePopulationSelect}
      />

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
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => {
                    /* Navegación al detalle del evento */
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos para el DatePicker
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
