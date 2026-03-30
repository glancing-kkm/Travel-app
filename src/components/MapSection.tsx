import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Pin } from '../types';

interface MapSectionProps {
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  pins: Pin[];
  onAddPin: (latitude: number, longitude: number) => void;
  onRemovePin: (id: string) => void;
  mapRef?: React.RefObject<MapView>;
}

export default function MapSection({ region, pins, onAddPin, onRemovePin, mapRef: externalRef }: MapSectionProps) {
  const internalRef = useRef<MapView>(null);
  const ref = externalRef || internalRef;

  return (
    <MapView
      ref={ref}
      style={styles.map}
      initialRegion={{
        ...region,
        latitudeDelta: region.latitudeDelta || 5,
        longitudeDelta: region.longitudeDelta || 5,
      }}
      onPress={(e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        onAddPin(latitude, longitude);
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {pins.map((pin, index) => (
        <Marker
          key={pin.id}
          coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
          title={pin.title}
          description={`장소 ${index + 1}`}
          pinColor="#1a73e8"
          onCalloutPress={() => onRemovePin(pin.id)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
