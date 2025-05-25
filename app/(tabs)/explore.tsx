/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  StatusBar,
  TouchableOpacity,
  Text,
  Platform,
  ActivityIndicator,
  InteractionManager,
  Alert,
} from 'react-native';
import type { Region } from 'react-native-maps';

import EventDetailModal from '@components/EventDetailModal';
import { useEvents } from '@context/eventsContext';
import { Event as EventModel } from '@models/Event';
import { getTowns } from '@services/LocationService';
import { styles } from '@styles/Explore';
import {
  INITIAL_REGION,
  INITIAL_BATCH,
  ZOOM_THRESHOLD,
  filterCategoryKeys,
} from 'app/constants/exploreConstants';
import { getAirQualityLevel } from 'app/exploreComponents/AirQualityResponse';
import { AnimatedNearbyEventsList } from 'app/exploreComponents/AnimatedNearbyEventsList';
import { CarouselToggle } from 'app/exploreComponents/CarouselToggle';
import { EventsModal } from 'app/exploreComponents/EventsModal';
import { EventCard } from 'app/exploreComponents/ExploreEventCard';
import { FilterControls } from 'app/exploreComponents/FilterControls';
import { FilterModal } from 'app/exploreComponents/FilterModal';
import { MapContainer, MapViewType } from 'app/exploreComponents/MapContainer';
import { PopulationSelector } from 'app/exploreComponents/PopulationSelector';

function getZoomFromLatDelta(latitudeDelta: number): number {
  return Math.log2(360 / latitudeDelta);
}

export default function Explore() {
  const { t } = useTranslation();
  const { events, loading, error } = useEvents();

  const mapRef = useRef<MapViewType>(null);
  const isMapReady = useRef(false);
  const debounceRef = useRef<number | null>(null);
  const [inputText, setInputText] = useState('');
  const [emissionsMode, setEmissionsMode] = useState(false);
  const [airQualityData, setAirQualityData] = useState<
    { event: EventModel; quality: number }[] | null
  >(null);
  const [isLoadingAirQuality, setIsLoadingAirQuality] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  //const [region, setRegion] = useState(INITIAL_REGION);
  const [, setRegion] = useState(INITIAL_REGION);

  const prevZoom = useRef(getZoomFromLatDelta(INITIAL_REGION.latitudeDelta));
  const [, setClusteringEnabled] = useState(true);
  const previousClusteringState = useRef(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedPopulation, setSelectedPopulation] = useState<string | null>(
    null
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [populationList, setPopulationList] = useState<any[]>([]);
  const [maxEventsToProcess, setMaxEventsToProcess] = useState(INITIAL_BATCH);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [eventsModalVisible, setEventsModalVisible] = useState(false);
  const [populationDropdownVisible, setPopulationDropdownVisible] =
    useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentMode, setCurrentMode] = useState<'start' | 'end'>('start');
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [selectedEventDetail, setSelectedEventDetail] =
    useState<EventModel | null>(null);

  const [carouselVisible, setCarouselVisible] = useState(true);

  const toggleEmissionsMode = useCallback(async () => {
    const newMode = !emissionsMode;
    setEmissionsMode(newMode);

    if (newMode && !airQualityData) {
      // Fetch air quality data when enabling the mode
      await fetchAirQualityData();
    }
  }, [emissionsMode, airQualityData, filteredMarkers]);

  // Función optimizada para evitar llamadas duplicadas a la API
  const fetchAirQualityData = async () => {
    if (isLoadingAirQuality) {
      return;
    }

    setIsLoadingAirQuality(true);

    try {
      const eventsWithLocation = filteredMarkers.filter(
        (event) => event.location?.latitude && event.location?.longitude
      );

      // Crear un mapa para agrupar eventos por coordenadas
      const locationMap = new Map();

      // Agrupar eventos por sus coordenadas
      eventsWithLocation.forEach((event) => {
        if (event.location?.latitude && event.location?.longitude) {
          // Crear una clave única para cada par de coordenadas
          const locationKey = `${event.location.latitude.toFixed(5)},${event.location.longitude.toFixed(5)}`;

          if (!locationMap.has(locationKey)) {
            locationMap.set(locationKey, {
              coords: {
                latitude: event.location.latitude,
                longitude: event.location.longitude,
              },
              events: [],
            });
          }

          locationMap.get(locationKey).events.push(event);
        }
      });

      // Procesar ubicaciones únicas en lotes
      const uniqueLocations = Array.from(locationMap.values());
      const batchSize = 20;
      let results: { event: EventModel; quality: number }[] = [];

      for (let i = 0; i < uniqueLocations.length; i += batchSize) {
        const batch = uniqueLocations.slice(i, i + batchSize);
        const batchPromises = batch.map(async (location) => {
          try {
            const data = await getAirQualityLevel(
              location.coords.latitude,
              location.coords.longitude
            );

            // Aplicar el mismo valor de calidad del aire a todos los eventos en esta ubicación
            // Seleccionar solo un evento representante para cada ubicación
            return [
              {
                event: location.events[0],
                quality: data.value,
                // Guardamos una referencia a todos los eventos en esta ubicación si fuera necesario
                allEventsAtLocation: location.events,
              },
            ];
          } catch (err) {
            console.error(
              `Error fetching air quality for location ${location.coords.latitude},${location.coords.longitude}:`,
              err
            );
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        // Aplanar el array de resultados y filtrar los nulos
        const flattenedResults = batchResults
          .filter(Boolean)
          .flatMap((result) => result);

        results = [...results, ...flattenedResults];
      }

      setAirQualityData(results);
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      Alert.alert(t('common.error'), t('explore.emissions.errorFetchingData'));
      setEmissionsMode(false);
    } finally {
      setIsLoadingAirQuality(false);
    }
  };

  // Implementar precarga de datos de calidad del aire
  const [preloadedAirQualityData, setPreloadedAirQualityData] = useState<
    { event: EventModel; quality: number }[] | null
  >(null);
  const isPreloading = useRef(false);

  // Precarga de datos optimizada

  const preloadAirQualityData = useCallback(async () => {
    if (
      isPreloading.current ||
      preloadedAirQualityData ||
      isLoadingAirQuality
    ) {
      return;
    }

    isPreloading.current = true;

    try {
      const eventsToProcess = filteredMarkers.slice(0, 20);
      const eventsWithLocation = eventsToProcess.filter(
        (event) => event.location?.latitude && event.location?.longitude
      );

      // Crear un mapa para agrupar eventos por coordenadas
      const locationMap = new Map();

      // Agrupar eventos por sus coordenadas
      eventsWithLocation.forEach((event) => {
        if (event.location?.latitude && event.location?.longitude) {
          const locationKey = `${event.location.latitude.toFixed(5)},${event.location.longitude.toFixed(5)}`;

          if (!locationMap.has(locationKey)) {
            locationMap.set(locationKey, {
              coords: {
                latitude: event.location.latitude,
                longitude: event.location.longitude,
              },
              events: [],
            });
          }

          locationMap.get(locationKey).events.push(event);
        }
      });

      // Procesar ubicaciones únicas
      const uniqueLocations = Array.from(locationMap.values());

      // Usamos InteractionManager para asegurar que no interfiera con la UI
      InteractionManager.runAfterInteractions(async () => {
        const locationPromises = uniqueLocations.map(async (location) => {
          try {
            const data = await getAirQualityLevel(
              location.coords.latitude,
              location.coords.longitude
            );

            // Aplicar el mismo valor de calidad del aire a todos los eventos en esta ubicación
            return [
              {
                event: location.events[0],
                quality: data.value,
                // Guardamos una referencia a todos los eventos en esta ubicación si fuera necesario
                allEventsAtLocation: location.events,
              },
            ];
          } catch (err) {
            console.debug(`Preloading error for location:`, err);
            return null;
          }
        });

        const results = (await Promise.all(locationPromises))
          .filter(Boolean)
          .flatMap((result) => result);

        setPreloadedAirQualityData(results);
      });
    } catch (error) {
      console.debug('Error preloading air quality data:', error);
    } finally {
      isPreloading.current = false;
    }
  }, [filteredMarkers, isLoadingAirQuality, preloadedAirQualityData]);

  useEffect(() => {
    if (emissionsMode && filteredMarkers.length > 0) {
      fetchAirQualityData();
    }
  }, [emissionsMode, filteredMarkers]);

  // Efecto para fetchAirQualityData modificado
  useEffect(() => {
    if (emissionsMode) {
      if (preloadedAirQualityData) {
        // Usar datos precargados si están disponibles
        setAirQualityData(preloadedAirQualityData);
        setPreloadedAirQualityData(null); // Limpiar datos precargados

        // Si hay más marcadores que los precargados, cargar el resto
        if (filteredMarkers.length > 20) {
          fetchAirQualityData();
        }
      } else {
        // Si no hay datos precargados, cargar normalmente
        fetchAirQualityData();
      }
    } else {
      // Precargar datos cuando el modo emisiones está desactivado
      preloadAirQualityData();
    }
  }, [emissionsMode, filteredMarkers, preloadedAirQualityData]);

  const filterCategories = useMemo(() => {
    return filterCategoryKeys.map((group) => ({
      titleKey: group.titleKey,
      title: t(group.titleKey),
      items: group.items.map((item) => ({
        ...item,
        label: t(item.labelKey),
      })),
    }));
  }, [t]);

  const calculateCarouselPosition = () => {
    return 35;
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

  useEffect(() => {
    const fakeLocation = { latitude: 41.3851, longitude: 2.1734 };
    setUserLocation(fakeLocation);
    setLocationPermission(true);

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

  useEffect(() => {
    if (events.length > 0) {
      setMaxEventsToProcess(events.length);
      preloadAirQualityData();
    }
  }, [events.length]);

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

  const handleRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        const newZoom = getZoomFromLatDelta(newRegion.latitudeDelta);
        if (Math.abs(newZoom - prevZoom.current) > 0.5) {
          setRegion(newRegion);
          prevZoom.current = newZoom;

          const shouldEnableClustering = newZoom < ZOOM_THRESHOLD;
          if (shouldEnableClustering !== previousClusteringState.current) {
            previousClusteringState.current = shouldEnableClustering;
            setClusteringEnabled(shouldEnableClustering);
          }
        }
      }, 200);
    },
    [debounceRef, previousClusteringState]
  );

  const filteredMarkers = useMemo(() => {
    let eventsToProcess = events.slice(0, maxEventsToProcess);

    eventsToProcess = eventsToProcess.filter(
      (marker) =>
        marker.location?.latitude &&
        marker.location?.longitude &&
        marker.location.latitude !== 0 &&
        marker.location.longitude !== 0
    );

    if (
      selectedPopulation ||
      selectedCategories.size > 0 ||
      searchQuery.trim() !== ''
    ) {
      eventsToProcess = eventsToProcess.filter((marker) => {
        const selectedPopulationName = selectedPopulation
          ? (populationList.find((pop) => pop.id === selectedPopulation)
              ?.label ?? null)
          : null;

        if (
          selectedPopulation &&
          selectedPopulationName &&
          marker.location?.town.name !== selectedPopulationName
        ) {
          return false;
        }

        if (selectedCategories.size > 0) {
          if (Array.isArray(marker.categories)) {
            const hasMatchingCategory = marker.categories.some((category) =>
              selectedCategories.has(category.id.toString())
            );
            if (!hasMatchingCategory) {
              return false;
            }
          } else {
            return false;
          }
        }

        if (searchQuery.trim() !== '') {
          const text = searchQuery.toLowerCase();
          const title = (marker.title || '').toLowerCase();
          let categoryText = '';
          if (Array.isArray(marker.categories)) {
            categoryText = marker.categories
              .map((category) => category.name || '')
              .join(' ')
              .toLowerCase();
          }
          const location = (marker.location?.town.name ?? '').toLowerCase();
          const description = (marker.description ?? '').toLowerCase();

          if (
            !title.includes(text) &&
            !categoryText.includes(text) &&
            !location.includes(text) &&
            !description.includes(text)
          ) {
            return false;
          }
        }
        return true;
      });
    }

    if (startDate || endDate) {
      eventsToProcess = eventsToProcess.filter((marker) => {
        if (startDate && marker.date_ini) {
          const eventDate = new Date(marker.date_ini);
          if (eventDate < startDate) {
            return false;
          }
        }
        if (endDate && marker.date_end) {
          const eventDate = new Date(marker.date_end);
          if (eventDate > endDate) {
            return false;
          }
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
    populationList,
  ]);

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

  const clearFilters = useCallback(() => {
    setSelectedCategories(new Set());
    setStartDate(null);
    setEndDate(null);
    setSelectedPopulation(null);
    setSearchQuery('');
    setInputText('');
  }, []);

  const getNearbyEvents = useMemo(() => {
    const MAX_NEARBY = 10;
    if (!userLocation) {
      return filteredMarkers.slice(0, MAX_NEARBY);
    }

    return [...filteredMarkers.slice(0, 20)]
      .filter(
        (event: EventModel) =>
          event.location?.latitude && event.location?.longitude
      )
      .sort((a, b) => {
        if (
          !a.location?.latitude ||
          !a.location?.longitude ||
          !b.location?.latitude ||
          !b.location?.longitude
        ) {
          return 0;
        }
        const distA =
          (a.location.latitude - userLocation.latitude) ** 2 +
          (a.location.longitude - userLocation.longitude) ** 2;
        const distB =
          (b.location.latitude - userLocation.latitude) ** 2 +
          (b.location.longitude - userLocation.longitude) ** 2;
        return distA - distB;
      })
      .slice(0, MAX_NEARBY);
  }, [filteredMarkers, userLocation]);

  const openDetailModal = useCallback(async (event: EventModel) => {
    setSelectedEventDetail(event);
    setDetailModalVisible(true);
  }, []);

  const renderEventItem = useCallback(
    ({ item }: { item: EventModel }) => (
      <EventCard event={item} onPress={() => openDetailModal(item)} />
    ),
    [openDetailModal]
  );

  const formatDate = useCallback(
    (date: Date | null) =>
      date
        ? date.toLocaleDateString('ca-ES', {
            day: '2-digit',
            month: 'short',
          })
        : '',
    []
  );

  const visibleMarkers = useMemo(() => {
    return filteredMarkers;
  }, [filteredMarkers]);

  const handleMyLocationPress = useCallback(() => {
    if (userLocation && mapRef.current && isMapReady.current) {
      mapRef.current.animateToRegion(
        { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        1000
      );
    }
  }, [userLocation]);

  if (loading) {
    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#4285F4' />
          <Text style={styles.loadingText}>{t('Cargando mapa...')}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{t('explore.error', { message: error })}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor='transparent' />

      <MapContainer
        ref={mapRef}
        locationPermission={locationPermission}
        visibleMarkers={filteredMarkers}
        onRegionChangeComplete={handleRegionChangeComplete}
        onMapReady={handleMapReady}
        onMarkerPress={openDetailModal}
        onMyLocationPress={handleMyLocationPress}
        emissionsMode={emissionsMode}
        toggleEmissionsMode={toggleEmissionsMode}
        airQualityData={airQualityData}
      />

      <FilterControls
        inputText={inputText}
        setInputText={setInputText}
        setSearchQuery={setSearchQuery}
        toggleFilterModal={toggleFilterModal}
        selectedCategories={selectedCategories}
        selectedPopulation={selectedPopulation}
        startDate={startDate}
        endDate={endDate}
        clearFilters={clearFilters}
        handleCategoryPress={handleCategoryPress}
        filterCategories={filterCategories}
        formatDate={formatDate}
      />

      <View
        style={{
          position: 'absolute',
          top: 160,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        <CarouselToggle
          isVisible={carouselVisible}
          onToggle={toggleCarousel}
          t={t}
        />
      </View>

      <AnimatedNearbyEventsList
        events={getNearbyEvents}
        renderEventItem={renderEventItem}
        visible={carouselVisible}
        bottomPosition={calculateCarouselPosition()}
      />

      <TouchableOpacity style={styles.eventsButton} onPress={toggleEventsModal}>
        <Text style={styles.eventsButtonText}>
          {t('explore.events.allEvents')}
        </Text>
      </TouchableOpacity>

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
              })
            : currentMode === 'start'
              ? t('explore.filters.startDate')
              : t('explore.filters.endDate')
        }
        populationDropdownVisible={populationDropdownVisible}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        t={t}
      />

      <PopulationSelector
        visible={populationDropdownVisible}
        onClose={() => setPopulationDropdownVisible(false)}
        selectedPopulation={selectedPopulation}
        searchQuery=''
        setSearchQuery={() => {}}
        populations={populationList}
        onSelect={handlePopulationSelect}
        t={t}
      />

      <EventsModal
        visible={eventsModalVisible}
        toggleEventsModal={toggleEventsModal}
        filteredMarkers={filteredMarkers}
        t={t}
      />

      {selectedEventDetail && (
        <EventDetailModal
          visible={detailModalVisible}
          event={selectedEventDetail}
          onClose={() => setDetailModalVisible(false)}
          t={t}
        />
      )}

      {/* Indicador de carga para la calidad del aire */}
      {emissionsMode && isLoadingAirQuality && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#4285F4' />
            <Text style={styles.loadingText}>{t('Cargando emisiones...')}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
