import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pin, RouteResult } from '../../src/types';
import { getOptimizedRoute, setGeminiApiKey, getGeminiApiKey } from '../../src/services/gemini';

const PINS_STORAGE_KEY = 'travel_app_pins';
const API_KEY_STORAGE = 'gemini_api_key';

export default function RouteScreen() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [apiKey, setApiKeyState] = useState('');
  const [result, setResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // 탭 전환 시 핀 목록 새로고침
  useEffect(() => {
    const interval = setInterval(loadPins, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    await loadPins();
    try {
      const key = await AsyncStorage.getItem(API_KEY_STORAGE);
      if (key) {
        setApiKeyState(key);
        setGeminiApiKey(key);
      } else {
        setShowApiInput(true);
      }
    } catch {}
  };

  const loadPins = async () => {
    try {
      const stored = await AsyncStorage.getItem(PINS_STORAGE_KEY);
      if (stored) setPins(JSON.parse(stored));
    } catch {}
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) return;
    await AsyncStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    setGeminiApiKey(apiKey.trim());
    setShowApiInput(false);
  };

  const handleOptimize = async () => {
    if (pins.length < 2) {
      const msg = '지도 탭에서 최소 2개 이상의 장소를 핀으로 찍어주세요.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('알림', msg);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const routeResult = await getOptimizedRoute(pins);
      setResult(routeResult);
    } catch (err: any) {
      setError(err.message || 'AI 경로 최적화에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* API 키 설정 */}
      {showApiInput ? (
        <View style={styles.apiSection}>
          <Text style={styles.apiTitle}>Gemini API 키 설정</Text>
          <Text style={styles.apiDesc}>
            AI 경로 최적화를 위해 Google Gemini API 키가 필요합니다.{'\n'}
            Google AI Studio에서 무료로 발급받을 수 있습니다.
          </Text>
          <TextInput
            style={styles.apiInput}
            placeholder="API 키를 입력하세요"
            value={apiKey}
            onChangeText={setApiKeyState}
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveApiKey}>
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setShowApiInput(true)} style={styles.apiToggle}>
          <Text style={styles.apiToggleText}>API 키 변경</Text>
        </TouchableOpacity>
      )}

      {/* 현재 핀 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>선택된 장소 ({pins.length}개)</Text>
        {pins.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>지도 탭에서 장소를 핀으로 찍어주세요</Text>
          </View>
        ) : (
          pins.map((pin, i) => (
            <View key={pin.id} style={styles.pinItem}>
              <View style={styles.pinDot}>
                <Text style={styles.pinDotText}>{i + 1}</Text>
              </View>
              <View style={styles.pinInfo}>
                <Text style={styles.pinTitle}>{pin.title}</Text>
                <Text style={styles.pinCoord}>
                  {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 최적화 버튼 */}
      <TouchableOpacity
        style={[styles.optimizeButton, (loading || pins.length < 2) && styles.buttonDisabled]}
        onPress={handleOptimize}
        disabled={loading || pins.length < 2}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.optimizeButtonText}>AI 최적 경로 추천받기</Text>
        )}
      </TouchableOpacity>

      {/* 에러 */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* 결과 */}
      {result && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>추천 경로</Text>

          {/* 요약 카드 */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>📏</Text>
              <Text style={styles.summaryLabel}>총 거리</Text>
              <Text style={styles.summaryValue}>{result.totalDistance}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>⏱</Text>
              <Text style={styles.summaryLabel}>예상 시간</Text>
              <Text style={styles.summaryValue}>{result.estimatedTime}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>💰</Text>
              <Text style={styles.summaryLabel}>예상 비용</Text>
              <Text style={styles.summaryValue}>{result.estimatedCost}</Text>
            </View>
          </View>

          {/* 최적 순서 */}
          <View style={styles.orderSection}>
            <Text style={styles.subTitle}>최적 방문 순서</Text>
            {result.optimizedOrder.map((pin, i) => (
              <View key={pin.id} style={styles.orderItem}>
                <View style={styles.orderLine}>
                  <View style={styles.orderDot}>
                    <Text style={styles.orderDotText}>{i + 1}</Text>
                  </View>
                  {i < result.optimizedOrder.length - 1 && <View style={styles.orderConnector} />}
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderName}>{pin.title}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* 구간별 상세 */}
          {result.segments.length > 0 && (
            <View style={styles.segmentSection}>
              <Text style={styles.subTitle}>구간별 상세</Text>
              {result.segments.map((seg, i) => (
                <View key={i} style={styles.segmentCard}>
                  <Text style={styles.segmentRoute}>
                    {seg.from} → {seg.to}
                  </Text>
                  <View style={styles.segmentDetails}>
                    <Text style={styles.segmentDetail}>🚗 {seg.transport}</Text>
                    <Text style={styles.segmentDetail}>📏 {seg.distance}</Text>
                    <Text style={styles.segmentDetail}>⏱ {seg.duration}</Text>
                    <Text style={styles.segmentDetail}>💰 {seg.cost}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 여행 팁 */}
          {result.tips.length > 0 && (
            <View style={styles.tipsSection}>
              <Text style={styles.subTitle}>여행 팁</Text>
              {result.tips.map((tip, i) => (
                <View key={i} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>💡</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20, paddingBottom: 40 },
  apiSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  apiTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#1a1a2e' },
  apiDesc: { fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 18 },
  apiInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  saveButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  apiToggle: { alignSelf: 'flex-end', marginBottom: 10 },
  apiToggleText: { fontSize: 12, color: '#888', textDecorationLine: 'underline' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { fontSize: 13, color: '#aaa' },
  pinItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  pinDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pinDotText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pinInfo: { flex: 1 },
  pinTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  pinCoord: { fontSize: 11, color: '#999', marginTop: 1 },
  optimizeButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.5 },
  optimizeButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorBox: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e53935',
  },
  errorText: { color: '#c62828', fontSize: 13 },
  resultSection: { marginTop: 8 },
  resultTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIcon: { fontSize: 24, marginBottom: 6 },
  summaryLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  summaryValue: { fontSize: 13, fontWeight: '700', color: '#1a73e8', textAlign: 'center' },
  orderSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  subTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 14 },
  orderItem: { flexDirection: 'row', minHeight: 50 },
  orderLine: { width: 36, alignItems: 'center' },
  orderDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  orderDotText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  orderConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#d0dff5',
    marginTop: -2,
  },
  orderInfo: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  orderName: { fontSize: 14, fontWeight: '600', color: '#333' },
  segmentSection: { marginBottom: 16 },
  segmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentRoute: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  segmentDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmentDetail: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tipsSection: {
    backgroundColor: '#fffde7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tipItem: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  tipBullet: { fontSize: 14, marginRight: 8 },
  tipText: { fontSize: 13, color: '#555', flex: 1, lineHeight: 20 },
});
