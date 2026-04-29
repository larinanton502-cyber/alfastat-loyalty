import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import {
  getSubscriptionById,
  DAILY_BONUS,
} from '../constants/subscriptions';
import HistoryItem from '../components/HistoryItem';
import { notify } from '../utils/dialog';

const formatDate = (ts) => {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear()}`;
};

const HomeScreen = ({ navigation }) => {
  const { user, canClaimDaily, claimDailyBonus } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!user) return null;

  const subscription = getSubscriptionById(user.currentSubscription);
  const recent = user.history.slice(0, 3);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claimDailyBonus();
      notify({ title: 'Успех', message: `Начислено ${DAILY_BONUS} баллов!` });
    } catch (e) {
      notify({ title: 'Не получилось', message: e.message });
    } finally {
      setClaiming(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.greetingBlock}>
          <Text style={styles.hello}>Привет,</Text>
          <Text style={styles.name}>{user.name}!</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Баланс баллов</Text>
          <Text style={styles.balanceValue}>
            {user.balance.toLocaleString('ru-RU')}
          </Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceCol}>
              <Text style={styles.balanceColLabel}>Текущий тариф</Text>
              <Text style={styles.balanceColValue}>{subscription.name}</Text>
            </View>
            {user.subscriptionExpiry && (
              <View style={styles.balanceCol}>
                <Text style={styles.balanceColLabel}>Действует до</Text>
                <Text style={styles.balanceColValue}>
                  {formatDate(user.subscriptionExpiry)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canClaimDaily || claiming}
          onPress={handleClaim}
          style={[
            styles.dailyCard,
            !canClaimDaily && styles.dailyCardDisabled,
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.dailyTitle}>
              {canClaimDaily ? 'Ежедневный бонус' : 'Бонус уже получен'}
            </Text>
            <Text style={styles.dailySubtitle}>
              {canClaimDaily
                ? `Получите +${DAILY_BONUS} баллов прямо сейчас`
                : 'Возвращайтесь завтра за новым бонусом'}
            </Text>
          </View>
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>
              {canClaimDaily ? `+${DAILY_BONUS}` : '✓'}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Быстрые действия</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Subscriptions')}
          >
            <Text style={styles.actionIcon}>★</Text>
            <Text style={styles.actionLabel}>Тарифы</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.actionIcon}>≡</Text>
            <Text style={styles.actionLabel}>История</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.actionIcon}>●</Text>
            <Text style={styles.actionLabel}>Профиль</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Последние операции</Text>
          {user.history.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.linkText}>Все →</Text>
            </TouchableOpacity>
          )}
        </View>

        {recent.length === 0 ? (
          <Text style={styles.empty}>Операций пока нет</Text>
        ) : (
          recent.map((h) => <HistoryItem key={h.id} item={h} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 18,
    paddingBottom: 40,
  },
  greetingBlock: {
    marginBottom: 18,
  },
  hello: {
    fontSize: 16,
    color: colors.textMuted,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: colors.textOnPrimary,
    fontSize: 44,
    fontWeight: '900',
    marginVertical: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 14,
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 1,
  },
  balanceCol: {
    flex: 1,
  },
  balanceColLabel: {
    color: colors.accent,
    fontSize: 11,
    marginBottom: 3,
  },
  balanceColValue: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginBottom: 18,
  },
  dailyCardDisabled: {
    opacity: 0.55,
    borderColor: colors.border,
  },
  dailyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  dailySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  dailyBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  dailyBadgeText: {
    color: colors.textOnPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 6,
    fontWeight: '700',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
});

export default HomeScreen;
