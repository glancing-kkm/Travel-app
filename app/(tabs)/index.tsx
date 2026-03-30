import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapSection from '../../src/components/MapSection';
import { searchPlaces, SearchResult } from '../../src/services/geocoding';
import { Pin } from '../../src/types';

const PINS_STORAGE_KEY = 'travel_app_pins';
const { width } = Dimensions.get('window');

export default function MapScreen() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [region] = useState({
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 5,
    longitudeDelta: 5,
  });

  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadPins();
  }, []);

  // 디바운스 검색
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (text.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlaces(text);
        setSearchResults(results);
        setShowResults(results.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  const handleSelectResult = async (result: SearchResult) => {
    const newPin: Pin = {
      id: Date.now().toString(),
      latitude: result.latitude,
      longitude: result.longitude,
      title: result.name,
    };
    await savePins([...pins, newPin]);

    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    Keyboard.dismiss();
  };

  const loadPins = async () => {
    try {
      const stored = await AsyncStorage.getItem(PINS_STORAGE_KEY);
      if (stored) setPins(JSON.parse(stored));
    } catch {}
  };

  const savePins = async (newPins: Pin[]) => {
    setPins(newPins);
    await AsyncStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(newPins));
  };

  const addPin = async (latitude: number, longitude: number) => {
    const title = `핀 ${pins.length + 1}`;
    const newPin: Pin = {
      id: Date.now().toString(),
      latitude,
      longitude,
      title,
    };
    await savePins([...pins, newPin]);
  };

  const removePin = (id: string) => {
    if (Platform.OS === 'web') {
      savePins(pins.filter((p) => p.id !== id));
    } else {
      Alert.alert('핀 삭제', '이 핀을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => savePins(pins.filter((p) => p.id !== id)) },
      ]);
    }
  };

  const clearAllPins = () => {
    if (pins.length === 0) return;
    if (Platform.OS === 'web') {
      if (confirm('모든 핀을 삭제하시겠습니까?')) {
        savePins([]);
      }
    } else {
      Alert.alert('전체 삭제', '모든 핀을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '전체 삭제', style: 'destructive', onPress: () => savePins([]) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <MapSection
        region={region}
        pins={pins}
        onAddPin={addPin}
        onRemovePin={removePin}
      />

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="장소, 주소, 도시 검색..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => {
              if (searchResults.length > 0) setShowResults(true);
            }}
            returnKeyType="search"
          />
          {isSearching && <ActivityIndicator size="small" color="#1a73e8" style={styles.searchSpinner} />}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowResults(false);
              }}
              style={styles.clearSearch}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 검색 결과 드롭다운 */}
        {showResults && (
          <View style={styles.resultsDropdown}>
            {searchResults.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.resultItem}
                onPress={() => handleSelectResult(result)}
              >
                <Text style={styles.resultIcon}>📍</Text>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {result.name}
                  </Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>
                    {result.displayName}
                  </Text>
                </View>
                <Text style={styles.resultAdd}>+</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 핀 목록 패널 */}
      <View style={styles.pinPanel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>선택한 장소 ({pins.length}개)</Text>
          {pins.length > 0 && (
            <TouchableOpacity onPress={clearAllPins}>
              <Text style={styles.clearButton}>전체 삭제</Text>
            </TouchableOpacity>
          )}
        </View>

        {pins.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>검색하거나 지도를 탭하여 장소를 추가하세요</Text>
          </View>
        ) : (
          <FlatList
            data={pins}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.pinList}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={styles.pinCard} onPress={() => {}}>
                <View style={styles.pinNumber}>
                  <Text style={styles.pinNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.pinName} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.pinCoord}>
                  {item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}
                </Text>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removePin(item.id)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // 검색 바
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  } as any,
  searchSpinner: { marginLeft: 8 },
  clearSearch: { marginLeft: 8, padding: 4 },
  clearSearchText: { fontSize: 16, color: '#aaa', fontWeight: '700' },
  // 검색 결과
  resultsDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    maxHeight: 280,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: { fontSize: 18, marginRight: 10 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
  resultAddress: { fontSize: 11, color: '#999' },
  resultAdd: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a73e8',
    marginLeft: 8,
    width: 28,
    textAlign: 'center',
  },
  // 핀 패널
  pinPanel: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    minHeight: 130,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  panelTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  clearButton: { fontSize: 13, color: '#e53935', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 15 },
  emptyIcon: { fontSize: 28, marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#999' },
  pinList: { paddingHorizontal: 16 },
  pinCard: {
    backgroundColor: '#f5f7ff',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    width: width * 0.38,
    borderWidth: 1,
    borderColor: '#e0e5f0',
  },
  pinNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  pinNumberText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pinName: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 2 },
  pinCoord: { fontSize: 10, color: '#999' },
  removeBtn: { position: 'absolute', top: 8, right: 8 },
  removeBtnText: { fontSize: 14, color: '#ccc', fontWeight: '700' },
});
