import React, { memo } from 'react';
import { Marker } from 'react-native-maps';
import { Event as EventModel } from '@models/Event';

type EventMarkerProps = {
  marker: EventModel;
  onPress: (event: EventModel) => void;
};

export const EventMarker = memo(({ marker, onPress }: EventMarkerProps) => {
  if (
    !marker.location ||
    typeof marker.location.latitude !== 'number' ||
    typeof marker.location.longitude !== 'number'
  ) {
    return null;
  }

  const coordinate = {
    latitude: marker.location.latitude,
    longitude: marker.location.longitude,
  };

  return (
    <Marker
      identifier={marker.id.toString()}
      coordinate={coordinate}
      title={marker.title}
      tracksViewChanges={false} // Important for performance
      onPress={() => onPress(marker)}
    />
  );
});

EventMarker.displayName = 'EventMarker';
