// app/exploreComponents/MapContainer.tsx
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  InteractionManager,
  Animated,
} from 'react-native';
import MapViewClustering from 'react-native-map-clustering-fh';
import MapView, { Marker, Region, Heatmap } from 'react-native-maps';
import Supercluster from 'supercluster';

import type { Event as EventModel } from '@models/Event';
import { styles } from '@styles/Explore';
import { INITIAL_REGION } from 'app/constants/exploreConstants';

import { EventMarker } from './EventMarker';

// Dummy i18n t function – replace with actual i18n if needed
const t = (key: string) => key;

export type MapViewType = MapViewClustering & {
  animateToRegion(region: Region, duration?: number): void;
};

export interface MapContainerProps {
  locationPermission: boolean;
  visibleMarkers: EventModel[];
  onRegionChangeComplete: (region: Region) => void;
  onMapReady: () => void;
  onMarkerPress: (event: EventModel) => void;
  onMyLocationPress: () => void;
  emissionsMode: boolean;
  toggleEmissionsMode: () => void;
  airQualityData: { event: EventModel; quality: number }[] | null;
}

export const MapContainer = forwardRef<MapViewType, MapContainerProps>(
  (props, forwardedRef) => {
    const {
      locationPermission,
      visibleMarkers,
      onRegionChangeComplete,
      onMapReady,
      onMarkerPress,
      onMyLocationPress,
      emissionsMode,
      toggleEmissionsMode,
      airQualityData,
    } = props;

    const mapRef = useRef<MapViewType | null>(null);

    const handleMapInstance = useCallback(
      (instance: MapViewType | null) => {
        mapRef.current = instance;
        if (typeof forwardedRef === 'function') {
          forwardedRef(instance);
        } else if (forwardedRef && 'current' in forwardedRef) {
          forwardedRef.current = instance;
        }
      },
      [forwardedRef]
    );

    const indexRef = useRef(
      new Supercluster({
        radius: 40,
        maxZoom: 19,
      })
    );

    const [clusters, setClusters] = useState<any[]>([]);
    const [region, setRegion] = useState<Region>(INITIAL_REGION);
    const [legendVisible, setLegendVisible] = useState(false); // Nuevo estado para la leyenda
    const legendContentHeight = useRef(new Animated.Value(0)).current; // Ref para la altura del contenido de la leyenda

    const debouncedUpdate = useMemo(
      () =>
        debounce((reg: Region) => {
          const bbox: [number, number, number, number] = [
            reg.longitude - reg.longitudeDelta / 2,
            reg.latitude - reg.latitudeDelta / 2,
            reg.longitude + reg.longitudeDelta / 2,
            reg.latitude + reg.latitudeDelta / 2,
          ];
          const zoom = Math.round(Math.log2(360 / reg.longitudeDelta));
          const newClusters = indexRef.current.getClusters(bbox, zoom);
          setClusters(newClusters);
        }, 200),
      []
    );

    useEffect(() => {
      if (!visibleMarkers.length) {
        setClusters([]);
        return;
      }

      const points = visibleMarkers
        .filter(
          (
            m
          ): m is EventModel & {
            location: { latitude: number; longitude: number };
          } =>
            !!m.location &&
            typeof m.location.latitude === 'number' &&
            typeof m.location.longitude === 'number'
        )
        .map((m) => ({
          type: 'Feature' as const,
          properties: { marker: m },
          geometry: {
            type: 'Point' as const,
            coordinates: [m.location.longitude, m.location.latitude],
          },
        }));

      if (points.length === 0) {
        setClusters([]);
        return;
      }

      indexRef.current.load(points);
      debouncedUpdate(region);
    }, [visibleMarkers, region, debouncedUpdate]);

    const handleRegionChangeComplete = useCallback(
      (newRegion: Region) => {
        setRegion(newRegion);
        onRegionChangeComplete(newRegion);
        InteractionManager.runAfterInteractions(() => {
          debouncedUpdate(newRegion);
        });
      },
      [onRegionChangeComplete, debouncedUpdate]
    );

    const getAirQualityColor = (quality: number) => {
      if (quality <= 700) {
        return 'rgba(0, 255, 0, 0.3)';
      }
      if (quality <= 800) {
        return 'rgba(255, 255, 0, 0.3)';
      }
      if (quality <= 1100) {
        return 'rgba(255, 165, 0, 0.3)';
      }
      if (quality <= 1500) {
        return 'rgba(255, 0, 0, 0.3)';
      }
      if (quality <= 2000) {
        return 'rgba(128, 0, 128, 0.3)';
      }
      if (quality <= 3000) {
        return 'rgba(128, 0, 0, 0.3)';
      }
      return 'rgba(0, 0, 0, 0.3)';
    };

    const renderClusters = () =>
      clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        if (cluster.properties.cluster) {
          const count = cluster.properties.point_count;
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              coordinate={{ latitude, longitude }}
              onPress={() => {
                const expansionZoom = indexRef.current.getClusterExpansionZoom(
                  cluster.id
                );
                const delta = 360 / Math.pow(2, expansionZoom);
                mapRef.current?.animateToRegion(
                  {
                    latitude,
                    longitude,
                    latitudeDelta: delta,
                    longitudeDelta: delta,
                  },
                  500
                );
              }}
            >
              <View style={styles.cluster}>
                <Text style={styles.clusterText}>{count}</Text>
              </View>
            </Marker>
          );
        } else {
          const m: EventModel = cluster.properties.marker;
          return (
            <EventMarker
              key={m.id}
              marker={m}
              onPress={() => onMarkerPress(m)}
            />
          );
        }
      });

    // Función para mostrar u ocultar la leyenda
    const toggleLegend = useCallback(() => {
      setLegendVisible((prev) => !prev);

      // Animar la altura del contenido
      Animated.timing(legendContentHeight, {
        toValue: legendVisible ? 0 : 100, // Ajusta este valor según la altura real del contenido
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [legendVisible, legendContentHeight]);

    // Modificación del heatmapPoints para quitar el pintado de toda Cataluña
    const heatmapPoints = useMemo(() => {
      if (!emissionsMode || !airQualityData) {
        return [];
      }

      // Crear un mapa para mantener un solo punto por ubicación
      const locationMap = new Map();

      airQualityData.forEach(({ event, quality }) => {
        if (event.location?.latitude && event.location?.longitude) {
          // Crear una clave única para cada ubicación
          const locationKey = `${event.location.latitude.toFixed(5)},${event.location.longitude.toFixed(5)}`;

          // Solo añadir el punto si esta ubicación no existe ya en el mapa
          if (!locationMap.has(locationKey)) {
            // Asignar pesos fijos por categoría
            let weight = 0;

            if (quality <= 700) {
              weight = 0.1;
            } // Buena
            else if (quality <= 800) {
              weight = 0.25;
            } // Moderada
            else if (quality <= 1100) {
              weight = 0.4;
            } // Regular
            else if (quality <= 1500) {
              weight = 0.6;
            } // Mala
            else if (quality <= 2000) {
              weight = 0.8;
            } // Muy Mala
            else {
              weight = 1.0;
            } // Peligrosa

            locationMap.set(locationKey, {
              latitude: event.location.latitude,
              longitude: event.location.longitude,
              weight: weight,
            });
          }
        }
      });

      // Convertir el mapa a un array de puntos y retornarlo directamente
      return Array.from(locationMap.values());
    }, [emissionsMode, airQualityData]);

    return (
      <>
        <MapView
          ref={handleMapInstance}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          onRegionChangeComplete={handleRegionChangeComplete}
          onMapReady={onMapReady}
          clusteringEnabled
          spiralEnabled
          animationEnabled
          maxZoom={19}
          minZoom={10}
          clusterColor='#4285F4'
          clusterTextColor='#fff'
        >
          {renderClusters()}

          {/* Replace the Circle components with a Heatmap */}
          {emissionsMode && heatmapPoints.length > 0 && (
            <Heatmap
              points={heatmapPoints}
              radius={50}
              opacity={0.7}
              gradient={{
                colors: [
                  'rgba(0, 255, 0, 0.7)',
                  'rgba(255, 255, 0, 0.7)',
                  'rgba(255, 165, 0, 0.7)',
                  'rgba(255, 0, 0, 0.7)',
                  'rgba(128, 0, 128, 0.7)',
                  'rgba(128, 0, 0, 0.7)',
                ],
                startPoints: [0, 0.2, 0.4, 0.6, 0.8, 1],
              }}
              gradientSmoothing={10}
              heatmapMode='POINTS_WEIGHT'
              maxIntensity={1.0}
              weatheringFactor={0.2}
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={onMyLocationPress}
        >
          <Ionicons name='locate' size={24} color='#4285F4' />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emissionsButton}
          onPress={toggleEmissionsMode}
        >
          <Ionicons
            name='leaf'
            size={24}
            color={emissionsMode ? '#4CAF50' : '#4285F4'}
          />
        </TouchableOpacity>

        {/* Leyenda de calidad del aire con estructura de dos columnas */}
        {emissionsMode && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.airQualityLegend,
              {
                // Cuando está colapsado, hacerlo más pequeño y centrado
                width: legendVisible ? 280 : 160,
                marginLeft: legendVisible ? -140 : -80, // La mitad del ancho para mantenerlo centrado
                padding: legendVisible ? 10 : 6,
              },
            ]}
            onPress={toggleLegend}
          >
            <View
              style={[
                styles.legendHeader,
                {
                  borderBottomWidth: legendVisible ? 1 : 0,
                  padding: legendVisible ? 8 : 4, // Menos padding cuando está colapsado
                  marginBottom: legendVisible ? 8 : 0, // Sin margen inferior cuando está colapsado
                },
              ]}
            >
              <Text
                style={[
                  styles.legendTitle,
                  {
                    fontSize: legendVisible ? 14 : 12, // Fuente más pequeña cuando está colapsado
                  },
                ]}
              >
                Leyenda emisiones
              </Text>
            </View>

            {/* Contenido animado de la leyenda */}
            {legendVisible && (
              <View style={styles.legendContent}>
                {/* Primera columna */}
                <View style={styles.legendColumn}>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: 'rgba(0, 255, 0, 0.7)' },
                      ]}
                    />
                    <Text style={styles.legendText}>Buena (0-700)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: 'rgba(255, 255, 0, 0.7)' },
                      ]}
                    />
                    <Text style={styles.legendText}>Moderada (701-800)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: 'rgba(255, 165, 0, 0.7)' },
                      ]}
                    />
                    <Text style={styles.legendText}>Regular (801-1100)</Text>
                  </View>
                </View>

                {/* Segunda columna */}
                <View style={styles.legendColumn}>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: 'rgba(255, 0, 0, 0.7)' },
                      ]}
                    />
                    <Text style={styles.legendText}>Mala (1101-1500)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: 'rgba(128, 0, 128, 0.7)' },
                      ]}
                    />
                    <Text style={styles.legendText}>M. Mala (1501-2000)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: 'rgba(128, 0, 0, 0.7)' },
                      ]}
                    />
                    <Text style={styles.legendText}>Peligrosa (2001+)</Text>
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}
      </>
    );
  }
);

MapContainer.displayName = 'MapContainer';
