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
import { getEvents, getEventDetails } from '../Services/EventsService';
import { getTowns } from '../Services/LocationService';

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

  // Estados para filtros: separamos categorías y población
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

  // Estados para eventos y ubicación
  const [events, setEvents] = useState<MarkerData[]>([]);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  // Estados para detalles y modales
  const [selectedEventDetail, setSelectedEventDetail] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const mapRef = useRef<MapView | null>(null);
  const [currentRegion, setCurrentRegion] = useState(INITIAL_REGION);

  // Definición de categorías para filtro
  const filterCategories: FilterCategory[] = [
    {
      title: 'Categoria',
      items: [
        {
          id: 'ActivitatsVirtuals',
          label: 'Activitats Virtuals',
          icon: 'globe-outline',
        },
        { id: 'RutesIVisites', label: 'Rutes I Visites', icon: 'map-outline' },
        { id: 'Conferencies', label: 'Conferencies', icon: 'mic-outline' },
        { id: 'Exposicions', label: 'Exposicions', icon: 'image-outline' },
        { id: 'Infantil', label: 'Infantil', icon: 'happy-outline' },
        { id: 'Teatre', label: 'Teatre', icon: 'film-outline' },
        { id: 'Concerts', label: 'Concerts', icon: 'musical-notes-outline' },
        { id: 'Dansa', label: 'Dansa', icon: 'body-outline' },
        { id: 'Cursos', label: 'Cursos', icon: 'school-outline' },
        {
          id: 'FestivalsIMostres',
          label: 'Festivals I Mostres',
          icon: 'sparkles-outline',
        },
        { id: 'Carnavals', label: 'Carnavals', icon: 'people-outline' },
        { id: 'Cicles', label: 'Cicles', icon: 'repeat-outline' },
        { id: 'Circ', label: 'Circ', icon: 'color-wand-outline' },
        { id: 'Festes', label: 'Festes', icon: 'beer-outline' },
        {
          id: 'FiresIMercats',
          label: 'Fires I Mercats',
          icon: 'basket-outline',
        },
        { id: 'Commemoracions', label: 'Commemoracions', icon: 'flag-outline' },
        { id: 'SetmanaSanta', label: 'Setmana Santa', icon: 'flower-outline' },
        { id: 'Sardanes', label: 'Sardanes', icon: 'people-circle-outline' },
        { id: 'Gegants', label: 'Gegants', icon: 'accessibility-outline' },
        { id: 'Nadal', label: 'Nadal', icon: 'snow-outline' },
        {
          id: 'CulturaDigital',
          label: 'Cultura Digital',
          icon: 'code-outline',
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchTowns = async () => {
      try {
        const towns = await getTowns();
        console.log('Towns:', towns);
        setPopulationList(towns);
      } catch (error) {
        console.error('Error loading towns:', error);
      }
    };
    fetchTowns();
  }, []);

  // Para este ejemplo se fakea la ubicación del usuario: Barcelona
  useEffect(() => {
    // Se omite la solicitud de permisos y se asigna la ubicación de Barcelona
    const fakeLocation = { latitude: 41.3851, longitude: 2.1734 };
    setUserLocation(fakeLocation);
    setLocationPermission(true);
    mapRef.current?.animateToRegion(
      { ...fakeLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      1000
    );
  }, []);

  // Cargar eventos desde el backend usando el eventsService
  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        const eventsFromService = await getEvents();
        setEvents(eventsFromService);
      } catch (error) {
        Alert.alert('Error', "No s'han pogut carregar els esdeveniments.");
      }
    };
    fetchEventsData();
  }, []);

  // Permite agregar o quitar una categoría sin afectar otras
  const handleCategoryPress = (filterId: string) => {
    setSelectedCategories((prev) => {
      const newCategories = new Set(prev);
      if (newCategories.has(filterId)) {
        newCategories.delete(filterId);
      } else {
        newCategories.add(filterId);
      }
      return newCategories;
    });
  };

  // Para población se mantiene de forma independiente (se asume selección única)
  const handlePopulationSelect = (populationId: string) => {
    setSelectedPopulation(populationId);
    setPopulationDropdownVisible(false);
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

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setStartDate(null);
    setEndDate(null);
    setSelectedPopulation(null);
  };

  // Se filtran los marcadores combinando fechas, categorías y población
  const filteredMarkers = events.filter((marker) => {
    // Filtro por fechas
    if (startDate && marker.fullDate < startDate) {
      return false;
    }
    if (endDate && marker.fullDate > endDate) {
      return false;
    }

    // Filtro por categorías
    if (
      selectedCategories.size > 0 &&
      !selectedCategories.has(marker.category)
    ) {
      return false;
    }

    // Filtro por población
    if (selectedPopulation && marker.location !== selectedPopulation) {
      return false;
    }

    // Filtro por búsqueda (buscando en título, categoría y ubicación)
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

  // En este ejemplo se muestran todos los marcadores filtrados (se puede habilitar filtrado por región si se desea)
  const getVisibleMarkers = () => {
    return filteredMarkers;
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

  // Se carga el detalle del evento usando el servicio
  const openDetailModal = async (eventId: string | number) => {
    try {
      const detail = await getEventDetails(eventId);
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
          // Fijamos de nuevo la ubicación a Barcelona
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
              .find((f) => f.id === filterId);
            if (!filter) {
              return null;
            }
            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, styles.filterButtonActive]}
                onPress={() => handleCategoryPress(filter.id)}
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
        // Ahora se pasan ambas variables de filtro de forma separada
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
        populations={[]} // O la lista de poblaciones obtenida de getTowns
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
function setPopulationList(towns: PopulationItem[]) {
  throw new Error('Function not implemented.');
}
