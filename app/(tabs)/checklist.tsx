import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { countries } from '../../src/data/countries';
import { ChecklistItem } from '../../src/types';

export default function ChecklistScreen() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const country = countries.find((c) => c.code === selectedCountry);

  const items: ChecklistItem[] =
    country?.checklist.map((item, i) => ({
      id: `${country.code}-${i}`,
      text: item.text,
      category: item.category,
      checked: checkedItems.has(`${country.code}-${i}`),
    })) || [];

  const categories = [...new Set(items.map((item) => item.category))];

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const checkedCount = items.filter((item) => checkedItems.has(item.id)).length;
  const progress = items.length > 0 ? checkedCount / items.length : 0;

  return (
    <View style={styles.container}>
      {/* 나라 선택 */}
      <View style={styles.countrySelector}>
        <Text style={styles.selectorLabel}>여행할 나라를 선택하세요</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countryList}>
          {countries.map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[styles.countryChip, selectedCountry === c.code && styles.countryChipActive]}
              onPress={() => {
                setSelectedCountry(c.code);
                setCheckedItems(new Set());
              }}
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
          <Text style={styles.emptyIcon}>🧳</Text>
          <Text style={styles.emptyTitle}>나라를 선택해주세요</Text>
          <Text style={styles.emptyDesc}>선택한 나라에 맞는 여행 준비물 체크리스트를 제공합니다</Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {/* 진행 상황 */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{country.name} 여행 준비</Text>
              <Text style={styles.progressCount}>
                {checkedCount}/{items.length}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}% 완료</Text>
          </View>

          {/* 카테고리별 체크리스트 */}
          {categories.map((category) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {items
                .filter((item) => item.category === category)
                .map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.checkItem, checkedItems.has(item.id) && styles.checkItemDone]}
                    onPress={() => toggleItem(item.id)}
                  >
                    <View style={[styles.checkbox, checkedItems.has(item.id) && styles.checkboxChecked]}>
                      {checkedItems.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text
                      style={[styles.checkText, checkedItems.has(item.id) && styles.checkTextDone]}
                    >
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          ))}
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
    backgroundColor: '#e8f0fe',
    borderColor: '#1a73e8',
  },
  countryChipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  countryChipTextActive: { color: '#1a73e8' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20 },
  listContainer: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 40 },
  progressCard: {
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
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  progressCount: { fontSize: 14, fontWeight: '700', color: '#1a73e8' },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e8ecf0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1a73e8',
    borderRadius: 4,
  },
  progressPercent: { fontSize: 11, color: '#888', textAlign: 'right' },
  categorySection: { marginBottom: 16 },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  checkItemDone: { backgroundColor: '#f5fff5' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  checkText: { fontSize: 14, color: '#333', flex: 1 },
  checkTextDone: { color: '#aaa', textDecorationLine: 'line-through' },
});
