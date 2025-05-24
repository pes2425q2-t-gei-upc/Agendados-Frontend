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
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Supercluster from 'supercluster';

import type { Event as EventModel } from '@models/Event';
import { INITIAL_REGION } from 'app/constants/exploreConstants';

import { EventMarker } from './EventMarker';

export type MapViewType = MapView & {
  animateToRegion(region: Region, duration?: number): void;
};

export interface MapContainerProps {
  locationPermission: boolean;
  visibleMarkers: EventModel[];
  onRegionChangeComplete: (region: Region) => void;
  onMapReady: () => void;
  onMarkerPress: (event: EventModel) => void;
  onMyLocationPress: () => void;
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
    } = props;

    // Ref interno al MapView para animaciones
    const mapRef = useRef<MapViewType | null>(null);
    const handleMapInstance = useCallback(
      (instance: MapViewType | null) => {
        mapRef.current = instance;
        if (typeof forwardedRef === 'function') {
          forwardedRef(instance);
        } else if (forwardedRef && 'current' in forwardedRef) {
          (forwardedRef as React.MutableRefObject<MapViewType | null>).current =
            instance;
        }
      },
      [forwardedRef]
    );

    // Creamos el idx sólo una vez
    const indexRef = useRef(
      new Supercluster({
        radius: 40,
        maxZoom: 19,
      })
    );

    const [clusters, setClusters] = useState<any[]>([]);
    const [region, setRegion] = useState<Region>(INITIAL_REGION);

    // 1️⃣ Debounce de actualización de clusters tras mover mapa
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

    // 2️⃣ Cuando cambian los markers, recargamos el índice (sólo aquí)
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
            coordinates: [m.location.longitude, m.location.latitude] as [
              number,
              number,
            ],
          },
        }));

      if (points.length === 0) {
        setClusters([]);
        return;
      }
      indexRef.current.load(points);
      // tras recargar, recalc con la región actual
      debouncedUpdate(region);
    }, [visibleMarkers, region, debouncedUpdate]);

    // 3️⃣ Al cambiar la región, throttle + InteractionManager
    const handleRegionChangeComplete = useCallback(
      (newRegion: Region) => {
        setRegion(newRegion);
        onRegionChangeComplete(newRegion);
        // Dejamos el cálculo de clusters para después de la animación/gesto
        InteractionManager.runAfterInteractions(() => {
          debouncedUpdate(newRegion);
        });
      },
      [onRegionChangeComplete, debouncedUpdate]
    );

    // 4️⃣ Renderizamos clusters o markers individuales
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
              <View style={localStyles.cluster}>
                <Text style={localStyles.clusterText}>{count}</Text>
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

    return (
      <>
        <MapView
          ref={handleMapInstance}
          style={localStyles.map}
          initialRegion={INITIAL_REGION}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          onRegionChangeComplete={handleRegionChangeComplete}
          onMapReady={onMapReady}
        >
          {renderClusters()}
        </MapView>
        <TouchableOpacity
          style={localStyles.myLocationButton}
          onPress={onMyLocationPress}
        >
          <Ionicons name='locate' size={24} color='#4285F4' />
        </TouchableOpacity>
      </>
    );
  }
);

MapContainer.displayName = 'MapContainer';

const localStyles = StyleSheet.create({
  cluster: {
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  clusterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  myLocationButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    bottom: 20,
    elevation: 3,
    padding: 8,
    position: 'absolute',
    right: 20,
  },
});
