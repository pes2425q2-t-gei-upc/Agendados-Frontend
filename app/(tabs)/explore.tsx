/* eslint-disable react-hooks/exhaustive-deps */
import { Ionicons } from '@expo/vector-icons';
import type { Ionicons as IoniconsType } from '@expo/vector-icons';
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from 'react';
import {
  View,
  StatusBar,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';
import type { Region } from 'react-native-maps';

import { getEventDetails } from '@services/EventsService';

import EventDetailModal from '../../components/EventDetailModal';
import { styles } from '../../styles/Explore';
import { useEvents } from '../context/eventsContext';
import { getTowns } from '../Services/LocationService';

import { EventCard } from './exploreComponents/EventCard';
import { EventsModal } from './exploreComponents/EventsModal';
import { FilterModal } from './exploreComponents/FilterModal';
import { PopulationSelector } from './exploreComponents/PopulationSelector';

type MapViewType = MapView & {
  animateToRegion(region: Region, duration: number): void;
};

type EventType = {
  id: string | number;
  title: string;
  description?: string;
  category?: string;
  categoryId?: string | number | null;
  location?: string;
  coordinate?: { latitude: number; longitude: number };
  fullDate?: Date;
  [key: string]: any;
};

type FilterItem = {
  id: string;
  label: string;
  icon: keyof typeof IoniconsType.glyphMap;
};

const filterCategories: { title: string; items: FilterItem[] }[] = [
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

// Región inicial (Barcelona en este ejemplo)
const INITIAL_REGION = {
  latitude: 41.3851,
  longitude: 2.1734,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Para carga progresiva de eventos
const INITIAL_BATCH = 100;
const BATCH_SIZE = 100;

// Umbral de zoom para controlar el clustering
const ZOOM_THRESHOLD = 14;

// Calcula el "zoom level" a partir del delta de latitud
function getZoomFromLatDelta(latitudeDelta: number): number {
  return Math.log2(360 / latitudeDelta);
}

// Componentes memoizados
const SearchBar = memo(
  ({
    inputText,
    setInputText,
    setSearchQuery,
    toggleFilterModal,
  }: {
    inputText: string;
    setInputText: (text: string) => void;
    setSearchQuery: (query: string) => void;
    toggleFilterModal: () => void;
  }) => {
    return (
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
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => setSearchQuery(inputText)}
          returnKeyType='search'
          placeholderTextColor='#999'
        />
        <TouchableOpacity
          onPress={() => setSearchQuery(inputText)}
          style={styles.searchButton}
        >
          <Ionicons name='arrow-forward' size={24} color='#666' />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={toggleFilterModal}
        >
          <Ionicons name='options-outline' size={24} color='#666' />
        </TouchableOpacity>
      </View>
    );
  }
);
SearchBar.displayName = 'SearchBar';

const ActiveFilters = memo(
  ({
    selectedCategories,
    selectedPopulation,
    startDate,
    endDate,
    clearFilters,
    handleCategoryPress,
    filterCategories,
    formatDate,
  }: {
    selectedCategories: Set<string>;
    selectedPopulation: string | null;
    startDate: Date | null;
    endDate: Date | null;
    clearFilters: () => void;
    handleCategoryPress: (id: string) => void;
    filterCategories: { title: string; items: FilterItem[] }[];
    formatDate: (date: Date) => string;
  }) => {
    return (
      <FlatList
        horizontal
        data={[
          ...(selectedCategories.size > 0 || selectedPopulation
            ? [{ type: 'clear' }]
            : []),
          ...(startDate || endDate ? [{ type: 'date' }] : []),
          ...Array.from(selectedCategories).map((id) => ({
            type: 'category',
            id,
            filter: filterCategories
              .flatMap((cat) => cat.items)
              .find((f) => f.id === id),
          })),
        ]}
        keyExtractor={(item, index) =>
          item.type === 'category' && 'id' in item
            ? `cat-${item.id}`
            : `${item.type}-${index}`
        }
        renderItem={({ item }) => {
          if (item.type === 'clear') {
            return (
              <TouchableOpacity
                style={styles.clearFilterChip}
                onPress={clearFilters}
              >
                <Ionicons name='close-circle' size={16} color='#fff' />
                <Text style={styles.clearFilterText}>Esborrar filtres</Text>
              </TouchableOpacity>
            );
          }
          if (item.type === 'date') {
            return (
              <View style={styles.dateRangeChip}>
                <Ionicons name='calendar' size={16} color='#666' />
                <Text style={styles.filterText}>
                  {startDate ? formatDate(startDate) : 'Data inici'} -{' '}
                  {endDate ? formatDate(endDate) : 'Data fi'}
                </Text>
              </View>
            );
          }
          if (item.type === 'category' && 'filter' in item && item.filter) {
            return (
              <TouchableOpacity
                style={[styles.filterChip, styles.filterButtonActive]}
                onPress={() => handleCategoryPress(item.id)}
              >
                <Ionicons name={item.filter.icon} size={16} color='#fff' />
                <Text style={[styles.filterText, styles.filterTextActive]}>
                  {item.filter.label}
                </Text>
                <Ionicons
                  name='close-circle'
                  size={14}
                  color='#fff'
                  style={styles.removeFilterIcon}
                />
              </TouchableOpacity>
            );
          }
          return null;
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScrollContainer}
      />
    );
  }
);
ActiveFilters.displayName = 'ActiveFilters';

const NearbyEventsList = memo(
  ({
    events,
    renderEventItem,
  }: {
    events: EventType[];
    renderEventItem: ({ item }: { item: EventType }) => React.ReactElement;
  }) => {
    return (
      <FlatList
        horizontal
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.nearbyEventsScrollContainer}
      />
    );
  }
);
NearbyEventsList.displayName = 'NearbyEventsList';

export default function Explore() {
  const { events, loading, error } = useEvents();

  const mapRef = useRef<MapViewType>(null);
  const isMapReady = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const detailCache = useRef(new Map());
  const [inputText, setInputText] = useState('');

  // Estados de ubicación
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  // Estados de región y clustering
  const [region, setRegion] = useState(INITIAL_REGION);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const previousClusteringState = useRef(true);

  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedPopulation, setSelectedPopulation] = useState<string | null>(
    null
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Estados para la lista de poblaciones y max de eventos a procesar
  const [populationList, setPopulationList] = useState<any[]>([]);
  const [maxEventsToProcess, setMaxEventsToProcess] = useState(INITIAL_BATCH);

  // Estados para los modales
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [populationDropdownVisible, setPopulationDropdownVisible] =
    useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentMode, setCurrentMode] = useState<'start' | 'end'>('start');
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Estado para el detalle de un evento concreto
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);

  // Cargar lista de poblaciones (simulada en este ejemplo)
  useEffect(() => {
    let isMounted = true;
    const fetchTowns = async () => {
      try {
        const towns = await getTowns();
        if (isMounted) {
          setPopulationList(towns);
        }
      } catch (err) {
        console.error('Error loading towns:', err);
      }
    };
    fetchTowns();
    return () => {
      isMounted = false;
    };
  }, []);

  // Ubicación de usuario (ficticia)
  useEffect(() => {
    const fakeLocation = { latitude: 41.3851, longitude: 2.1734 };
    setUserLocation(fakeLocation);
    setLocationPermission(true);

    // Anima la cámara hacia la ubicación inicial tras asegurar que el mapa está listo
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        if (mapRef.current && isMapReady.current) {
          mapRef.current.animateToRegion(
            { ...fakeLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 },
            1000
          );
        }
      }, 500);
    });
  }, []);

  // Carga progresiva de eventos
  useEffect(() => {
    if (maxEventsToProcess < events.length) {
      const timer = setTimeout(() => {
        setMaxEventsToProcess((prev) =>
          Math.min(prev + BATCH_SIZE, events.length)
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [maxEventsToProcess, events.length]);

  // Callback handlers
  const toggleFilterModal = useCallback(
    () => setFilterModalVisible((prev) => !prev),
    []
  );

  const toggleEventsModal = useCallback(
    () => setEventsModalVisible((prev) => !prev),
    []
  );

  const handleMapReady = useCallback(() => {
    isMapReady.current = true;
  }, []);

  // Actualiza región y clustering de forma controlada
  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setRegion(newRegion);
      const approximateZoom = getZoomFromLatDelta(newRegion.latitudeDelta);
      const shouldEnableClustering = approximateZoom < ZOOM_THRESHOLD;

      if (shouldEnableClustering !== previousClusteringState.current) {
        previousClusteringState.current = shouldEnableClustering;
        setClusteringEnabled(shouldEnableClustering);
      }
    }, 200);
  }, []);

  // Filtro de eventos principal
  // Modifica esta parte de la función filteredMarkers en Explore.js

  // Filtro de eventos principal
  const filteredMarkers = useMemo(() => {
    let eventsToProcess = events.slice(0, maxEventsToProcess);

    // Coordenadas válidas
    eventsToProcess = eventsToProcess.filter(
      (marker) =>
        marker.coordinate?.latitude &&
        marker.coordinate?.longitude &&
        marker.coordinate.latitude !== 0 &&
        marker.coordinate.longitude !== 0
    );

    // Filtrar por población, categorías y texto
    if (
      selectedPopulation ||
      selectedCategories.size > 0 ||
      searchQuery.trim() !== ''
    ) {
      eventsToProcess = eventsToProcess.filter((marker) => {
        // FIX: Obtener el nombre de la población seleccionada
        const selectedPopulationName = selectedPopulation
          ? populationList.find((pop) => pop.id === selectedPopulation)
              ?.label || null
          : null;

        // FIX: Comparar usando el nombre de la población en lugar del ID
        if (
          selectedPopulation &&
          selectedPopulationName &&
          marker.location !== selectedPopulationName
        ) {
          return false;
        }

        if (
          selectedCategories.size > 0 &&
          marker.categoryId != null &&
          !selectedCategories.has(marker.categoryId.toString())
        ) {
          return false;
        }

        if (searchQuery.trim() !== '') {
          const text = searchQuery.toLowerCase();
          const title = (marker.title || '').toLowerCase();
          const category = (marker.category || '').toLowerCase();
          const location = (marker.location || '').toLowerCase();
          if (
            !title.includes(text) &&
            !category.includes(text) &&
            !location.includes(text)
          ) {
            return false;
          }
        }
        return true;
      });
    }

    // Filtrar por rango de fechas
    if (startDate || endDate) {
      eventsToProcess = eventsToProcess.filter((marker) => {
        if (startDate && marker.fullDate && marker.fullDate < startDate) {
          return false;
        }
        if (endDate && marker.fullDate && marker.fullDate > endDate) {
          return false;
        }
        return true;
      });
    }
    return eventsToProcess;
  }, [
    events,
    startDate,
    endDate,
    selectedCategories,
    selectedPopulation,
    searchQuery,
    maxEventsToProcess,
    populationList, // FIX: Añadir populationList a las dependencias
  ]);

  // Selección de fechas
  const openDatePicker = useCallback(
    (mode: 'start' | 'end') => {
      setCurrentMode(mode);
      setDatePickerDate(
        mode === 'start' ? (startDate ?? new Date()) : (endDate ?? new Date())
      );
      if (Platform.OS === 'ios') {
        setShowStartDatePicker(mode === 'start');
        setShowEndDatePicker(mode === 'end');
      } else {
        setShowStartDatePicker(mode === 'start');
        setShowEndDatePicker(mode === 'end');
      }
    },
    [startDate, endDate]
  );

  const onDateChange = useCallback(
    (event: unknown, selectedDate?: Date) => {
      if (!selectedDate) {
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        return;
      }
      setDatePickerDate(selectedDate);

      // En Android se confirma en cuanto el usuario selecciona
      if (Platform.OS === 'android') {
        if (currentMode === 'start') {
          setStartDate(selectedDate);
        } else {
          setEndDate(selectedDate);
        }
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
      }
    },
    [currentMode]
  );

  const handleDatePickerConfirm = useCallback(() => {
    if (currentMode === 'start') {
      setStartDate(datePickerDate);
    } else {
      setEndDate(datePickerDate);
    }
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  }, [currentMode, datePickerDate]);

  const closeDatePicker = useCallback(() => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  }, []);

  // Manejo de categorías y población
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

  const handlePopulationSelect = useCallback((populationId: string | null) => {
    setSelectedPopulation(populationId);
    setPopulationDropdownVisible(false);
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setSelectedCategories(new Set());
    setStartDate(null);
    setEndDate(null);
    setSelectedPopulation(null);
    setSearchQuery('');
  }, []);

  // Eventos cercanos (simple aproximación)
  const getNearbyEvents = useMemo(() => {
    const MAX_NEARBY = 10;
    if (!userLocation) {
      return filteredMarkers.slice(0, MAX_NEARBY);
    }

    return [...filteredMarkers.slice(0, 20)]
      .filter((ev) => ev.coordinate)
      .sort((a, b) => {
        if (!a.coordinate || !b.coordinate) {
          return 0;
        }
        const distA =
          (a.coordinate.latitude - userLocation.latitude) ** 2 +
          (a.coordinate.longitude - userLocation.longitude) ** 2;
        const distB =
          (b.coordinate.latitude - userLocation.latitude) ** 2 +
          (b.coordinate.longitude - userLocation.longitude) ** 2;
        return distA - distB;
      })
      .slice(0, MAX_NEARBY);
  }, [filteredMarkers, userLocation]);

  // Cargar detalle de evento (con caché)
  const openDetailModal = useCallback(async (eventId: string | number) => {
    try {
      const cachedDetail = detailCache.current.get(eventId.toString());
      if (cachedDetail) {
        setSelectedEventDetail(cachedDetail);
        setDetailModalVisible(true);
        return;
      }
      const detail = await getEventDetails(eventId);
      detailCache.current.set(eventId.toString(), detail);
      setSelectedEventDetail(detail);
      setDetailModalVisible(true);
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      Alert.alert(
        'Error',
        "No s'han pogut carregar els detalls de l'esdeveniment."
      );
    }
  }, []);

  // Render de un item de evento en la lista horizontal
  const renderEventItem = useCallback(
    ({ item }: { item: EventType }) => (
      <EventCard event={item} onPress={() => openDetailModal(item.id)} />
    ),
    [openDetailModal]
  );

  // Formato de fecha (chips de rango)
  const formatDate = useCallback(
    (date: Date | null) =>
      date
        ? date.toLocaleDateString('ca-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '',
    []
  );

  // Marcadores visibles según la región (optimización opcional)
  const visibleMarkers = useMemo(() => {
    return filteredMarkers.filter((marker) => {
      if (!marker.coordinate) {
        return false;
      }
      const { latitude, longitude } = marker.coordinate;
      return (
        latitude >= region.latitude - region.latitudeDelta &&
        latitude <= region.latitude + region.latitudeDelta &&
        longitude >= region.longitude - region.longitudeDelta &&
        longitude <= region.longitude + region.longitudeDelta
      );
    });
  }, [filteredMarkers, region]);

  // Marcador memoizado para mejorar rendimiento en la lista de <Marker />
  const MemoizedMarker = memo(({ marker }: { marker: EventType }) => {
    if (
      !marker.coordinate ||
      typeof marker.coordinate.latitude !== 'number' ||
      typeof marker.coordinate.longitude !== 'number'
    ) {
      return null;
    }
    return (
      <Marker
        identifier={marker.id.toString()}
        coordinate={marker.coordinate}
        title={marker.title}
        tracksViewChanges={false}
        onPress={() => openDetailModal(marker.id)}
      />
    );
  });
  MemoizedMarker.displayName = 'MemoizedMarker';

  // MapView memoizado para evitar rerenders innecesarios
  const memoizedMapView = useMemo(
    () => (
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={locationPermission}
        showsMyLocationButton={false}
        initialRegion={INITIAL_REGION}
        maxZoom={19}
        minZoom={10}
        radius={40}
        nodeSize={64}
        clusterColor='#4285F4'
        clusterTextColor='#fff'
        removeClippedSubviews
        animationEnabled
        clusteringEnabled={clusteringEnabled}
        spiralEnabled
        preserveClusterPressBehavior
        zoomControlEnabled={false}
        onRegionChangeComplete={handleRegionChangeComplete}
        onMapReady={handleMapReady}
        moveOnMarkerPress
        loadingEnabled
        loadingIndicatorColor='#4285F4'
        loadingBackgroundColor='rgba(255, 255, 255, 0.7)'
      >
        {visibleMarkers.map((marker) => (
          <MemoizedMarker key={marker.id} marker={marker} />
        ))}
      </MapView>
    ),
    [
      visibleMarkers,
      clusteringEnabled,
      locationPermission,
      handleRegionChangeComplete,
      handleMapReady,
    ]
  );

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

      {memoizedMapView}

      {/* Botón para centrar en la ubicación del usuario */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={() => {
          if (userLocation && mapRef.current && isMapReady.current) {
            mapRef.current.animateToRegion(
              { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
              1000
            );
          }
        }}
      >
        <Ionicons name='locate' size={24} color='#4285F4' />
      </TouchableOpacity>

      {/* Barra de búsqueda y filtros */}
      <View style={styles.searchContainer}>
        <SearchBar
          inputText={inputText}
          setInputText={setInputText}
          setSearchQuery={setSearchQuery}
          toggleFilterModal={toggleFilterModal}
        />

        <ActiveFilters
          selectedCategories={selectedCategories}
          selectedPopulation={selectedPopulation}
          startDate={startDate}
          endDate={endDate}
          clearFilters={clearFilters}
          handleCategoryPress={handleCategoryPress}
          filterCategories={filterCategories}
          formatDate={formatDate}
        />
      </View>

      {/* Lista horizontal de eventos cercanos */}
      <View style={styles.nearbyEventsContainer}>
        <NearbyEventsList
          events={getNearbyEvents}
          renderEventItem={renderEventItem}
        />
      </View>

      {/* Botón para ver todos los eventos filtrados */}
      <TouchableOpacity style={styles.eventsButton} onPress={toggleEventsModal}>
        <Text style={styles.eventsButtonText}>Tots els esdeveniments</Text>
      </TouchableOpacity>

      {/* Modales */}
      <FilterModal
        visible={filterModalVisible}
        onSelectPopulation={handlePopulationSelect}
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
        formatDate={(date) =>
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
        searchQuery=''
        setSearchQuery={() => {}}
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
