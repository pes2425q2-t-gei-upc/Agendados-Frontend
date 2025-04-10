/* eslint-disable react-native/no-inline-styles */
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
import { useTranslation } from 'react-i18next'; // Add this import
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
  Animated,
  Easing,
  StyleSheet,
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
  [key: string]: unknown;
};

type FilterItem = {
  id: string;
  label: string;
  icon: keyof typeof IoniconsType.glyphMap;
};

// Dentro del componente Explore

// Región inicial (Barcelona en este ejemplo)
const INITIAL_REGION = {
  latitude: 41.3851,
  longitude: 2.1734,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Para carga progresiva de eventos
const INITIAL_BATCH = 100;

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
    t, // Add translation function as prop
  }: {
    inputText: string;
    setInputText: (text: string) => void;
    setSearchQuery: (query: string) => void;
    toggleFilterModal: () => void;
    t: (key: string) => string; // Add type for translation function
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
          placeholder={t('explore.search.placeholder')}
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
    t, // Add translation function as prop
  }: {
    selectedCategories: Set<string>;
    selectedPopulation: string | null;
    startDate: Date | null;
    endDate: Date | null;
    clearFilters: () => void;
    handleCategoryPress: (id: string) => void;
    filterCategories: { title: string; items: FilterItem[] }[];
    formatDate: (date: Date) => string;
    t: (key: string) => string; // Add type for translation function
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
                <Text style={styles.clearFilterText}>
                  {t('explore.search.clearFilters')}
                </Text>
              </TouchableOpacity>
            );
          }
          if (item.type === 'date') {
            return (
              <View style={styles.dateRangeChip}>
                <Ionicons name='calendar' size={16} color='#666' />
                <Text style={styles.filterText}>
                  {startDate
                    ? formatDate(startDate)
                    : t('explore.filters.startDate')}{' '}
                  -{' '}
                  {endDate ? formatDate(endDate) : t('explore.filters.endDate')}
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

// Componente para el control de visibilidad del carrusel
const CarouselToggle = memo(
  ({
    onToggle,
    isVisible,
    t,
  }: {
    onToggle: () => void;
    isVisible: boolean;
    t: (key: string) => string;
  }) => {
    // Animación para rotación del icono
    const rotateAnim = useRef(new Animated.Value(isVisible ? 0 : 1)).current;

    // Efecto para animar cuando cambia el estado
    useEffect(() => {
      Animated.timing(rotateAnim, {
        toValue: isVisible ? 0 : 1,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start();
    }, [isVisible, rotateAnim]);

    // Cálculo de la rotación en base al valor de la animación
    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <TouchableOpacity
        style={carouselStyles.toggleButton}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={carouselStyles.toggleContainer}>
          <Text style={carouselStyles.toggleText}>
            {isVisible
              ? t('explore.events.hideEvents') || 'Ocultar esdeveniments'
              : t('explore.events.nearbyEvents') || 'Esdeveniments Propers'}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name='chevron-up' size={24} color='#4285F4' />
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  }
);
CarouselToggle.displayName = 'CarouselToggle';

// Modificación del componente NearbyEventsList para incluir animación
type AnimatedNearbyEventsListProps = {
  events: EventType[];
  renderEventItem: ({ item }: { item: EventType }) => React.ReactElement;
  visible: boolean;
  bottomPosition: number;
};

const AnimatedNearbyEventsList = memo(
  ({
    events,
    renderEventItem,
    visible,
    bottomPosition,
  }: AnimatedNearbyEventsListProps) => {
    const slideAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
    const heightAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: visible ? 1 : 0,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim, {
          toValue: visible ? 1 : 0,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
      ]).start();
    }, [visible, slideAnim, heightAnim]);

    const translateY = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [180, 0],
    });

    const opacity = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const animatedStyle = {
      opacity,
      transform: [{ translateY }],
      maxHeight: heightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 300],
      }),
      overflow: 'visible' as const,
      position: 'absolute' as const,
      bottom: bottomPosition,
      left: 0,
      right: 0,
    };

    return (
      <Animated.View style={animatedStyle}>
        <View style={carouselStyles.listContainer}>
          <FlatList
            horizontal
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nearbyEventsScrollContainer}
          />
        </View>
      </Animated.View>
    );
  }
);
AnimatedNearbyEventsList.displayName = 'AnimatedNearbyEventsList';

export default function Explore() {
  // Add translation hook
  const { t } = useTranslation();
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
  const prevZoom = useRef(getZoomFromLatDelta(INITIAL_REGION.latitudeDelta));
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

  // Estado para controlar la visibilidad del carrusel
  const [carouselVisible, setCarouselVisible] = useState(true);
  const filterCategories: { title: string; items: FilterItem[] }[] = [
    {
      title: t('filters.category'),
      items: [
        {
          id: '1',
          label: t('categories.concerts'),
          icon: 'musical-notes-outline',
        },
        { id: '2', label: t('categories.exhibitions'), icon: 'image-outline' },
        { id: '3', label: t('categories.routes'), icon: 'map-outline' },
        { id: '4', label: t('categories.festivals'), icon: 'sparkles-outline' },
        { id: '5', label: t('categories.cycles'), icon: 'repeat-outline' },
        { id: '6', label: t('categories.theater'), icon: 'film-outline' },
        { id: '7', label: t('categories.conferences'), icon: 'mic-outline' },
        { id: '8', label: t('categories.children'), icon: 'happy-outline' },
        {
          id: '9',
          label: t('categories.commemorations'),
          icon: 'flag-outline',
        },
        { id: '10', label: t('categories.holyWeek'), icon: 'flower-outline' },
        {
          id: '11',
          label: t('categories.sardanas'),
          icon: 'people-circle-outline',
        },
        { id: '12', label: t('categories.dance'), icon: 'body-outline' },
        { id: '13', label: t('categories.courses'), icon: 'school-outline' },
        { id: '14', label: t('categories.parties'), icon: 'beer-outline' },
        {
          id: '15',
          label: t('categories.fairsMarkets'),
          icon: 'basket-outline',
        },
        {
          id: '16',
          label: t('categories.giants'),
          icon: 'accessibility-outline',
        },
        { id: '17', label: t('categories.circus'), icon: 'color-wand-outline' },
        {
          id: '18',
          label: t('categories.digitalCulture'),
          icon: 'code-outline',
        },
        {
          id: '19',
          label: t('categories.virtualActivities'),
          icon: 'globe-outline',
        },
      ],
    },
  ];

  const calculateCarouselPosition = () => {
    return 35; // Valor fijo, sin depender de los filtros
  };
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

  useEffect(() => {
    if (events.length > 0) {
      setMaxEventsToProcess(events.length);
    }
  }, [events.length]);

  // Callback handlers
  const toggleFilterModal = useCallback(
    () => setFilterModalVisible((prev) => !prev),
    []
  );

  const toggleEventsModal = useCallback(
    () => setEventsModalVisible((prev) => !prev),
    []
  );

  const toggleCarousel = useCallback(
    () => setCarouselVisible((prev) => !prev),
    []
  );

  const handleMapReady = useCallback(() => {
    isMapReady.current = true;
  }, []);

  // Actualiza región y clustering de forma controlada

  const handleRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        const newZoom = getZoomFromLatDelta(newRegion.latitudeDelta);
        // Solo actualiza si el cambio de zoom es mayor a un umbral (por ejemplo, 0.5)
        if (Math.abs(newZoom - prevZoom.current) > 0.5) {
          setRegion(newRegion);
          prevZoom.current = newZoom;

          const shouldEnableClustering = newZoom < ZOOM_THRESHOLD;
          if (shouldEnableClustering !== previousClusteringState.current) {
            previousClusteringState.current = shouldEnableClustering;
            setClusteringEnabled(shouldEnableClustering);
          }
        }
        // Si solo se mueve (panning) y el zoom no cambia, no actualizamos el estado.
      }, 200);
    },
    [debounceRef, previousClusteringState]
  );

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
          ? (populationList.find((pop) => pop.id === selectedPopulation)
              ?.label ?? null)
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
          t={t}
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
          t={t}
        />
      </View>

      {/* Control de visibilidad del carrusel */}
      <View
        style={{
          position: 'absolute',
          top: 160,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <CarouselToggle
          isVisible={carouselVisible}
          onToggle={toggleCarousel}
          t={t}
        />
      </View>

      {/* Lista horizontal de eventos cercanos (ahora con animación) */}
      <AnimatedNearbyEventsList
        events={getNearbyEvents}
        renderEventItem={renderEventItem}
        visible={carouselVisible}
        bottomPosition={calculateCarouselPosition()} // Pasa la posición calculada
      />

      {/* Botón para ver todos los eventos filtrados */}
      <TouchableOpacity style={styles.eventsButton} onPress={toggleEventsModal}>
        <Text style={styles.eventsButtonText}>
          {t('explore.events.allEvents')}
        </Text>
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
              ? t('explore.filters.startDate')
              : t('explore.filters.endDate')
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
        onEventPress={(id) => {
          openDetailModal(id);
          toggleEventsModal();
        }}
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

// Estilos para los componentes de carrusel
const carouselStyles = StyleSheet.create({
  listContainer: {
    paddingVertical: 10,
  },
  toggleButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '600',
  },
});
