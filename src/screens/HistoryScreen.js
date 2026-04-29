import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import HistoryItem from '../components/HistoryItem';

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'purchase', label: 'Покупки' },
  { id: 'bonus', label: 'Бонусы' },
];

const HistoryScreen = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (!user) return [];
    if (filter === 'all') return user.history;
    if (filter === 'purchase')
      return user.history.filter((h) => h.type === 'purchase');
    if (filter === 'bonus')
      return user.history.filter(
        (h) => h.type === 'welcome' || h.type === 'daily'
      );
    return user.history;
  }, [user, filter]);

  const totalSpent = useMemo(
    () =>
      (user?.history || [])
        .filter((h) => h.type === 'purchase')
        .reduce((sum, h) => sum + h.pointsSpent, 0),
    [user]
  );
  const totalEarned = useMemo(
    () =>
      (user?.history || []).reduce((sum, h) => sum + (h.pointsEarned || 0), 0),
    [user]
  );

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Всего начислено</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            +{totalEarned.toLocaleString('ru-RU')}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Всего потрачено</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            −{totalSpent.toLocaleString('ru-RU')}
          </Text>
        </View>
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[
              styles.filterChip,
              filter === f.id && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.id && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryItem item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Записей пока нет</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 16,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.textOnPrimary,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 40,
    fontSize: 14,
  },
});

export default HistoryScreen;
