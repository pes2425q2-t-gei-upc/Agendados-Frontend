import { Ionicons } from '@expo/vector-icons';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Location from 'expo-location';
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  StatusBar,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { getEventDetails } from '@services/EventsService';

import EventDetailModal from '../../components/EventDetailModal';
import { useEvents } from '../../context/eventsContext'; // <-- Usamos el contexto
import { styles } from '../../styles/Explore';
import { getTowns } from '../Services/LocationService';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EventCard, MarkerData } from './exploreComponents/EventCard';
import { EventsModal } from './exploreComponents/EventsModal';
import { FilterModal } from './exploreComponents/FilterModal';
import { PopulationSelector } from './exploreComponents/PopulationSelector';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type FilterItem = { id: string; label: string; icon: IconName };
type LocationCoords = { latitude: number; longitude: number };
export type PopulationItem = { id: string; label: string };
type FilterCategory = { title: string; items: FilterItem[] };

const INITIAL_REGION = {
  latitude: 41.3851,
  longitude: 2.1734,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function Explore() {
  // Obtenemos eventos desde el contexto global
  const { events, loading, error } = useEvents();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedPopulation, setSelectedPopulation] = useState<string | null>(
    null
  );

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [populationDropdownVisible, setPopulationDropdownVisible] =
    useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentMode, setCurrentMode] = useState<'start' | 'end'>('start');
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [populationList, setPopulationList] = useState<PopulationItem[]>([]);

  // Estados para ubicación
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  // Estados para detalle y modales
  const [selectedEventDetail, setSelectedEventDetail] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const mapRef = useRef<MapView | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentRegion, setCurrentRegion] = useState(INITIAL_REGION);

  // Definición de filtros de categorías (ligados con id y label)
  const filterCategories: FilterCategory[] = [
    {
      title: 'Categoria',
      items: [
        { id: '1', label: 'Concerts', icon: 'musical-notes-outline' },
        { id: '2', label: 'Exposicions', icon: 'image-outline' },
        { id: '3', label: 'Rutes I Visites', icon: 'map-outline' },
        { id: '4', label: 'Festivals I Mostres', icon: 'sparkles-outline' },
        { id: '5', label: 'Cicles', icon: 'repeat-outline' },
        { id: '6', label: 'Teatre', icon: 'film-outline' },
        { id: '7', label: 'Conferencies', icon: 'mic-outline' },
        { id: '8', label: 'Infantil', icon: 'happy-outline' },
        { id: '9', label: 'Commemoracions', icon: 'flag-outline' },
        { id: '10', label: 'Setmana Santa', icon: 'flower-outline' },
        { id: '11', label: 'Sardanes', icon: 'people-circle-outline' },
        { id: '12', label: 'Dansa', icon: 'body-outline' },
        { id: '13', label: 'Cursos', icon: 'school-outline' },
        { id: '14', label: 'Festes', icon: 'beer-outline' },
        { id: '15', label: 'Fires I Mercats', icon: 'basket-outline' },
        { id: '16', label: 'Gegants', icon: 'accessibility-outline' },
        { id: '17', label: 'Circ', icon: 'color-wand-outline' },
        { id: '18', label: 'Cultura Digital', icon: 'code-outline' },
        { id: '19', label: 'Activitats Virtuals', icon: 'globe-outline' },
      ],
    },
  ];

  useEffect(() => {
    // Pre-cargar poblaciones
    const fetchTowns = async () => {
      try {
        const towns = await getTowns();
        setPopulationList(towns);
      } catch (error) {
        console.error('Error loading towns:', error);
      }
    };
    fetchTowns();
  }, []);

  // Fake location para Barcelona
  useEffect(() => {
    const fakeLocation = { latitude: 41.3851, longitude: 2.1734 };
    setUserLocation(fakeLocation);
    setLocationPermission(true);
    mapRef.current?.animateToRegion(
      { ...fakeLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      1000
    );
  }, []);

  // Función para agregar/quitar categorías
  const handleCategoryPress = useCallback((filterId: string) => {
    setSelectedCategories((prev) => {
      const newCategories = new Set(prev);
      if (newCategories.has(filterId)) {
        newCategories.delete(filterId);
      } else {
        newCategories.add(filterId);
      }
      return newCategories;
    });
  }, []);

  // Selección única de población
  const handlePopulationSelect = (populationId: string) => {
    setSelectedPopulation(populationId);
    setPopulationDropdownVisible(false);
  };

  const toggleFilterModal = () => setFilterModalVisible((prev) => !prev);
  const toggleEventsModal = () => setEventsModalVisible((prev) => !prev);

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

  const onDateChange = (event: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setDatePickerDate(selectedDate);
      if (Platform.OS === 'android') {
        if (currentMode === 'start') {
          setStartDate(selectedDate);
        } else {
          setEndDate(selectedDate);
        }
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
      }
    } else {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
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

  const closeDatePicker = () => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setStartDate(null);
    setEndDate(null);
    setSelectedPopulation(null);
  };

  const filteredMarkers = useMemo(() => {
    return events.filter((marker) => {
      if (startDate && marker.fullDate < startDate) {
        return false;
      }
      if (endDate && marker.fullDate > endDate) {
        return false;
      }
      if (
        selectedCategories.size > 0 &&
        marker.categoryId !== undefined &&
        marker.categoryId !== null &&
        !selectedCategories.has(marker.categoryId.toString())
      ) {
        return false;
      }
      if (selectedPopulation && marker.location !== selectedPopulation) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const searchText = searchQuery.toLowerCase();
        if (
          !marker.title.toLowerCase().includes(searchText) &&
          !marker.category.toLowerCase().includes(searchText) &&
          !marker.location.toLowerCase().includes(searchText)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    events,
    startDate,
    endDate,
    selectedCategories,
    selectedPopulation,
    searchQuery,
  ]);

  const getVisibleMarkers = () => {
    return filteredMarkers;
  };

  const getNearbyEvents = useMemo(() => {
    if (!userLocation) {
      return filteredMarkers;
    }
    return [...filteredMarkers].sort((a, b) => {
      const distA = Math.hypot(
        a.coordinate.latitude - userLocation.latitude,
        a.coordinate.longitude - userLocation.longitude
      );
      const distB = Math.hypot(
        b.coordinate.latitude - userLocation.latitude,
        b.coordinate.longitude - userLocation.longitude
      );
      return distA - distB;
    });
  }, [filteredMarkers, userLocation]);

  const openDetailModal = useCallback(async (eventId: string | number) => {
    try {
      const detail = await getEventDetails(eventId);
      setSelectedEventDetail(detail);
      setDetailModalVisible(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert(
        'Error',
        "No s'han pogut carregar els detalls de l'esdeveniment."
      );
    }
  }, []);

  // Mientras se cargan los eventos, mostramos un spinner
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='#4285F4' />
        <Text>Cargando eventos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor='transparent' />
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={(region) => setCurrentRegion(region)}
      >
        {getVisibleMarkers().map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={() => {
          const fakeLocation = { latitude: 41.3851, longitude: 2.1734 };
          setUserLocation(fakeLocation);
          mapRef.current?.animateToRegion(
            { ...fakeLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
            1000
          );
        }}
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
            placeholder='Barcelona, concerts...'
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
          {(selectedCategories.size > 0 || selectedPopulation) && (
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
                {startDate
                  ? startDate.toLocaleDateString('ca-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Data inici'}{' '}
                -{' '}
                {endDate
                  ? endDate.toLocaleDateString('ca-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Data fi'}
              </Text>
            </View>
          )}
          {Array.from(selectedCategories).map((filterId) => {
            const filter = filterCategories
              .flatMap((cat) => cat.items)
              .find((f) => f.id.toString() === filterId);
            if (!filter) {
              return null;
            }
            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, styles.filterButtonActive]}
                onPress={() => handleCategoryPress(filter.id.toString())}
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
      <View style={styles.nearbyEventsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nearbyEventsScrollContainer}
        >
          {getNearbyEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => openDetailModal(event.id)}
            />
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.eventsButton} onPress={toggleEventsModal}>
        <Text style={styles.eventsButtonText}>Tots els esdeveniments</Text>
      </TouchableOpacity>
      <FilterModal
        visible={filterModalVisible}
        onSelectPopulation={(populationId: string) =>
          handlePopulationSelect(populationId)
        }
        toggleFilterModal={toggleFilterModal}
        startDate={startDate}
        endDate={endDate}
        openDatePicker={openDatePicker}
        datePickerDate={datePickerDate}
        onDateChange={onDateChange}
        handleDatePickerConfirm={handleDatePickerConfirm}
        closeDatePicker={closeDatePicker}
        showStartDatePicker={showStartDatePicker}
        showEndDatePicker={showEndDatePicker}
        filterCategories={filterCategories}
        selectedCategories={selectedCategories}
        onCategoryPress={handleCategoryPress}
        selectedPopulation={selectedPopulation}
        populationList={populationList}
        setPopulationDropdownVisible={setPopulationDropdownVisible}
        clearFilters={clearFilters}
        formatDate={(date: Date | null) =>
          date
            ? date.toLocaleDateString('ca-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : currentMode === 'start'
              ? 'Data inici'
              : 'Data fi'
        }
        populationDropdownVisible={populationDropdownVisible}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <PopulationSelector
        visible={populationDropdownVisible}
        onClose={() => setPopulationDropdownVisible(false)}
        selectedPopulation={selectedPopulation}
        searchQuery={''}
        setSearchQuery={() => {}}
        populations={populationList} // Usamos la lista cargada
        onSelect={handlePopulationSelect}
      />
      <EventsModal
        visible={eventsModalVisible}
        toggleEventsModal={toggleEventsModal}
        filteredMarkers={filteredMarkers}
      />
      {selectedEventDetail && (
        <EventDetailModal
          event={selectedEventDetail}
          visible={detailModalVisible}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedEventDetail(null);
          }}
        />
      )}
    </View>
  );
}
