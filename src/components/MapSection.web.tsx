import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import L from 'leaflet';
import { Pin } from '../types';

interface MapSectionProps {
  region: { latitude: number; longitude: number };
  pins: Pin[];
  onAddPin: (latitude: number, longitude: number) => void;
  onRemovePin: (id: string) => void;
}

export default function MapSection({ region, pins, onAddPin, onRemovePin }: MapSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const callbacksRef = useRef({ onAddPin, onRemovePin });

  callbacksRef.current = { onAddPin, onRemovePin };

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([region.latitude, region.longitude], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        callbacksRef.current.onAddPin(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const blueIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    pins.forEach((pin, index) => {
      const marker = L.marker([pin.latitude, pin.longitude], { icon: blueIcon })
        .addTo(mapRef.current!)
        .bindPopup(
          `<b>${index + 1}. ${pin.title}</b><br>` +
          `<span style="font-size:11px;color:#888">${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}</span><br>` +
          `<button onclick="window.__removePin__('${pin.id}')" style="margin-top:4px;padding:4px 12px;background:#e53935;color:#fff;border:none;border-radius:4px;cursor:pointer;">삭제</button>`
        );
      markersRef.current.push(marker);
    });

    (window as any).__removePin__ = (id: string) => {
      callbacksRef.current.onRemovePin(id);
    };
  }, [pins]);

  return (
    <View style={styles.container}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
