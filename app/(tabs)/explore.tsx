/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StatusBar,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import EventDetailModal from '../../components/EventDetailModal';
import { styles } from '../../styles/Explore';
import { MockDataService } from '../Services/MockDataService';

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
  const router = useRouter();

  // Estados existentes
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
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
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [selectedPopulation, setSelectedPopulation] = useState<string | null>(
    null
  );
  const [populationSearchQuery, setPopulationSearchQuery] = useState('');
  const [events, setEvents] = useState<MarkerData[]>([]);

  // NUEVOS ESTADOS para el modal de detalle
  const [selectedEventDetail, setSelectedEventDetail] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const mapRef = useRef<MapView | null>(null);

  // NUEVO ESTADO para la región actual del mapa
  const [currentRegion, setCurrentRegion] = useState(INITIAL_REGION);

  // Categorías y lista de poblaciones
  const filterCategories: FilterCategory[] = [
    {
      title: 'Categoria',
      items: [
        { id: 'Music', label: 'Music', icon: 'musical-notes' },
        { id: 'Technology', label: 'Technology', icon: 'laptop' },
        { id: 'Food', label: 'Food', icon: 'restaurant' },
      ],
    },
  ];

  const populationList: PopulationItem[] = [
    { id: 'barcelona', label: 'Barcelona' },
    { id: 'girona', label: 'Girona' },
    { id: 'lleida', label: 'Lleida' },
    { id: 'tarragona', label: 'Tarragona' },
    // …otros elementos
  ];

  // Solicitar permisos de ubicación
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Cargar eventos del servicio mockup
  useEffect(() => {
    const dataService = new MockDataService();

    const fetchEvents = async () => {
      try {
        const eventsFromService = await dataService.getEvents();
        const mappedEvents = eventsFromService.map((event) => {
          const eventDate = new Date(event.data);
          return {
            id: event.id,
            coordinate: event.coordinate,
            title: event.title,
            description: `${event.categoria} - ${event.location}`,
            image: event.coverImage
              ? event.coverImage
              : require('@assets/images/ReyLeon.jpg'),
            date: eventDate.toLocaleDateString('ca-ES', {
              day: '2-digit',
              month: 'short',
            }),
            time: eventDate.toLocaleTimeString('ca-ES', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            fullDate: eventDate,
            category: event.categoria,
            location: event.location,
          } as unknown as MarkerData;
        });
        setEvents(mappedEvents);
      } catch (error) {
        Alert.alert('Error', "No s'han pogut carregar els esdeveniments.");
      }
    };

    fetchEvents();
  }, []);

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
      setUserLocation({ latitude, longitude });
      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        1000
      );
    } catch (error) {
      // Manejo de error
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

  const toggleFilterModal = () => setFilterModalVisible(!filterModalVisible);
  const toggleEventsModal = () => setEventsModalVisible(!eventsModalVisible);

  const openDatePicker = (mode: 'start' | 'end') => {
    setCurrentMode(mode);
    setDatePickerDate(
      mode === 'start' ? (startDate ?? new Date()) : (endDate ?? new Date())
    );
    if (Platform.OS === 'ios') {
      setShowStartDatePicker(mode === 'start');
      setShowEndDatePicker(mode === 'end');
    } else {
      mode === 'start'
        ? setShowStartDatePicker(true)
        : setShowEndDatePicker(true);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDatePickerDate(selectedDate);
      if (Platform.OS === 'android') {
        currentMode === 'start'
          ? setStartDate(selectedDate)
          : setEndDate(selectedDate);
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
      }
    } else {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
  };

  const handleDatePickerConfirm = () => {
    currentMode === 'start'
      ? setStartDate(datePickerDate)
      : setEndDate(datePickerDate);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const closeDatePicker = () => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const handlePopulationSelect = (populationId: string) => {
    setSelectedPopulation(populationId);
    setPopulationDropdownVisible(false);
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      populationList.forEach((pop) => newFilters.delete(pop.id));
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

  const filteredMarkers = events.filter((marker) => {
    if (startDate && marker.fullDate < startDate) {
      return false;
    }
    if (endDate && marker.fullDate > endDate) {
      return false;
    }
    if (activeFilters.size > 0 && !activeFilters.has(marker.category)) {
      return false;
    }
    return true;
  });

  // NUEVA FUNCIÓN para filtrar solo los marcadores dentro de la región visible
  const getVisibleMarkers = () => {
    const marginFactor = 0.2; // 20% extra de margen
    const latMargin = currentRegion.latitudeDelta * marginFactor;
    const lngMargin = currentRegion.longitudeDelta * marginFactor;

    const minLat =
      currentRegion.latitude - currentRegion.latitudeDelta / 2 - latMargin;
    const maxLat =
      currentRegion.latitude + currentRegion.latitudeDelta / 2 + latMargin;
    const minLng =
      currentRegion.longitude - currentRegion.longitudeDelta / 2 - lngMargin;
    const maxLng =
      currentRegion.longitude + currentRegion.longitudeDelta / 2 + lngMargin;

    return filteredMarkers.filter((marker) => {
      const { latitude, longitude } = marker.coordinate;
      return (
        latitude >= minLat &&
        latitude <= maxLat &&
        longitude >= minLng &&
        longitude <= maxLng
      );
    });
  };

  const getNearbyEvents = () => {
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
  };

  // Función para cargar los detalles del evento y abrir el modal
  const openDetailModal = async (eventId: string | number) => {
    try {
      const dataService = new MockDataService();
      const detail = await dataService.getEventDetails(eventId.toString());
      setSelectedEventDetail(detail);
      setDetailModalVisible(true);
    } catch (error) {
      Alert.alert(
        'Error',
        "No s'han pogut carregar els detalls de l'esdeveniment."
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor='transparent' />
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        initialRegion={INITIAL_REGION}
        // Actualiza la región actual al moverse o hacer zoom
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
          {(startDate ?? endDate) && (
            <View style={styles.dateRangeChip}>
              <Ionicons name='calendar' size={16} color='#666' />
              <Text style={styles.filterText}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
          )}
          {Array.from(activeFilters).map((filterId) => {
            const filter = filterCategories
              .flatMap((cat) => cat.items)
              .find((f) => f.id === filterId);
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
        activeFilters={activeFilters}
        handleFilterPress={handleFilterPress}
        populationList={populationList}
        selectedPopulation={selectedPopulation}
        setPopulationDropdownVisible={setPopulationDropdownVisible}
        clearFilters={clearFilters}
        formatDate={formatDate}
      />

      <PopulationSelector
        visible={populationDropdownVisible}
        onClose={() => setPopulationDropdownVisible(false)}
        selectedPopulation={selectedPopulation}
        searchQuery={populationSearchQuery}
        setSearchQuery={setPopulationSearchQuery}
        populations={populationList}
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
