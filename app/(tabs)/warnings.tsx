import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { countries } from '../../src/data/countries';

const levelColors = {
  low: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32', label: '낮음' },
  medium: { bg: '#fff8e1', border: '#ff9800', text: '#e65100', label: '보통' },
  high: { bg: '#ffebee', border: '#f44336', text: '#c62828', label: '높음' },
};

export default function WarningsScreen() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const country = countries.find((c) => c.code === selectedCountry);

  return (
    <View style={styles.container}>
      {/* 나라 선택 */}
      <View style={styles.countrySelector}>
        <Text style={styles.selectorLabel}>나라를 선택하세요</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countryList}>
          {countries.map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[styles.countryChip, selectedCountry === c.code && styles.countryChipActive]}
              onPress={() => setSelectedCountry(c.code)}
            >
              <Text style={[styles.countryChipText, selectedCountry === c.code && styles.countryChipTextActive]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {!country ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>나라를 선택해주세요</Text>
          <Text style={styles.emptyDesc}>선택한 나라의 여행 주의사항과 안전 정보를 확인할 수 있습니다</Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {/* 상단 요약 */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{country.name} 여행 주의사항</Text>
            <View style={styles.levelSummary}>
              {(['high', 'medium', 'low'] as const).map((level) => {
                const count = country.warnings.filter((w) => w.level === level).length;
                if (count === 0) return null;
                const colors = levelColors[level];
                return (
                  <View key={level} style={[styles.levelBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.levelBadgeText, { color: colors.text }]}>
                      {colors.label} {count}건
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 주의사항 카드들 */}
          {country.warnings
            .sort((a, b) => {
              const order = { high: 0, medium: 1, low: 2 };
              return order[a.level] - order[b.level];
            })
            .map((warning, i) => {
              const colors = levelColors[warning.level];
              return (
                <View
                  key={i}
                  style={[styles.warningCard, { borderLeftColor: colors.border }]}
                >
                  <View style={styles.warningHeader}>
                    <Text style={styles.warningIcon}>{warning.icon}</Text>
                    <View style={styles.warningHeaderInfo}>
                      <Text style={styles.warningTitle}>{warning.title}</Text>
                      <View style={[styles.warningLevel, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.warningLevelText, { color: colors.text }]}>
                          {warning.category} · {colors.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.warningDesc}>{warning.description}</Text>
                </View>
              );
            })}

          {/* 긴급 연락처 */}
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>긴급 연락처</Text>
            <View style={styles.emergencyItem}>
              <Text style={styles.emergencyLabel}>재외국민 긴급전화</Text>
              <Text style={styles.emergencyValue}>+82-2-3210-0404</Text>
            </View>
            <View style={styles.emergencyItem}>
              <Text style={styles.emergencyLabel}>외교부 영사콜센터</Text>
              <Text style={styles.emergencyValue}>+82-2-3210-0404</Text>
            </View>
            <View style={styles.emergencyItem}>
              <Text style={styles.emergencyLabel}>경찰 (대부분 국가)</Text>
              <Text style={styles.emergencyValue}>112 / 911 / 110</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  countrySelector: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectorLabel: { fontSize: 12, color: '#888', marginBottom: 10, fontWeight: '500' },
  countryList: { paddingRight: 20, gap: 8 },
  countryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  countryChipActive: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
  },
  countryChipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  countryChipTextActive: { color: '#e65100' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20 },
  listContainer: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 12 },
  levelSummary: { flexDirection: 'row', gap: 8 },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  levelBadgeText: { fontSize: 12, fontWeight: '700' },
  warningCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  warningHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  warningIcon: { fontSize: 28, marginRight: 12 },
  warningHeaderInfo: { flex: 1 },
  warningTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  warningLevel: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  warningLevelText: { fontSize: 11, fontWeight: '600' },
  warningDesc: { fontSize: 13, color: '#555', lineHeight: 20 },
  emergencyCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
  },
  emergencyTitle: { fontSize: 15, fontWeight: '700', color: '#1565c0', marginBottom: 12 },
  emergencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  emergencyLabel: { fontSize: 13, color: '#333' },
  emergencyValue: { fontSize: 13, fontWeight: '700', color: '#1565c0' },
});
