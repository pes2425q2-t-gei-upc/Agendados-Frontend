import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import MapView from 'react-native-map-clustering';
import type { Region } from 'react-native-maps';

import { Event as EventModel } from '@models/Event';
import { styles } from '@styles/Explore'; // Assuming styles are accessible or passed

import { INITIAL_REGION } from '../../constants/exploreConstants';

import { EventMarker } from './EventMarker';

export type MapViewType = MapView & {
  animateToRegion(region: Region, duration: number): void;
};

interface MapContainerProps {
  mapRef: React.RefObject<MapViewType>;
  clusteringEnabled: boolean;
  locationPermission: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  visibleMarkers: EventModel[];
  onRegionChangeComplete: (region: Region) => void;
  onMapReady: () => void;
  onMarkerPress: (event: EventModel) => void;
  onMyLocationPress: () => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  mapRef,
  clusteringEnabled,
  locationPermission,
  visibleMarkers,
  onRegionChangeComplete,
  onMapReady,
  onMarkerPress,
  onMyLocationPress,
}) => {
  return (
    <>
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
        onRegionChangeComplete={onRegionChangeComplete}
        onMapReady={onMapReady}
        moveOnMarkerPress
        loadingEnabled
        loadingIndicatorColor='#4285F4'
        loadingBackgroundColor='rgba(255, 255, 255, 0.7)'
      >
        {visibleMarkers.map((marker) => (
          <EventMarker
            key={marker.id}
            marker={marker}
            onPress={onMarkerPress}
          />
        ))}
      </MapView>
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={onMyLocationPress}
      >
        <Ionicons name='locate' size={24} color='#4285F4' />
      </TouchableOpacity>
    </>
  );
};
