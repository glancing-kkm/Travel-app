import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import L from 'leaflet';

interface WebMapProps {
  initialLatitude: number;
  initialLongitude: number;
  pins: { id: string; latitude: number; longitude: number; title: string }[];
  onMapPress: (latitude: number, longitude: number) => void;
  onMarkerPress: (id: string) => void;
}

export default function WebMap({ initialLatitude, initialLongitude, pins, onMapPress, onMarkerPress }: WebMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Leaflet CSS 주입
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // 마커 아이콘 경로 수정 (leaflet 기본 아이콘 문제 해결)
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([initialLatitude, initialLongitude], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapPress(e.latlng.lat, e.latlng.lng);
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

  // 핀 업데이트
  useEffect(() => {
    if (!mapRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 새 마커 추가
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
        .bindPopup(`<b>${index + 1}. ${pin.title}</b><br><button onclick="window.__removePin__('${pin.id}')">삭제</button>`);
      markersRef.current.push(marker);
    });

    // 전역 삭제 함수
    (window as any).__removePin__ = (id: string) => {
      onMarkerPress(id);
    };
  }, [pins]);

  return (
    <View style={styles.container}>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
