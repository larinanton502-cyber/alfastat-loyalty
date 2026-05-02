import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { SUBSCRIPTIONS } from '../constants/subscriptions';
import SubscriptionCard from '../components/SubscriptionCard';
import { getActivePromotions, formatRemaining } from '../utils/promotions';

const SubscriptionsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await getActivePromotions();
      if (alive) setPromotions(list);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!user) return null;

  const promoBySub = promotions.reduce((acc, p) => {
    acc[p.subscriptionId] = p;
    return acc;
  }, {});

  const heroPromo = promotions[0];
  const heroSub = heroPromo
    ? SUBSCRIPTIONS.find((s) => s.id === heroPromo.subscriptionId)
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>Доступно Альфа баллов</Text>
          <Text style={styles.balanceValue}>
            {user.balance.toLocaleString('ru-RU')}
          </Text>
        </View>

        <Text style={styles.heading}>Тарифы AlfaStat</Text>
        <Text style={styles.description}>
          Выберите подходящий тариф. Оплатите Альфа баллами и получите кэшбэк.
        </Text>

        <View style={styles.discountBanner}>
          <View style={styles.discountIcon}>
            <Text style={styles.discountIconText}>%</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.discountTitle}>
              Скидка при оплате вперёд
            </Text>
            <Text style={styles.discountSubtitle}>
              −10% при оплате на 6 месяцев · −20% при оплате на 12 месяцев.
              Длительность выбирается на странице тарифа.
            </Text>
          </View>
        </View>

        {heroPromo && heroSub && (
          <View style={styles.promoBanner}>
            <View style={styles.promoBannerHeader}>
              <Text style={styles.promoBannerLabel}>{heroPromo.label}</Text>
              <Text style={styles.promoBannerCountdown}>
                Осталось: {formatRemaining(heroPromo.expiresAt)}
              </Text>
            </View>
            <Text style={styles.promoBannerTitle}>
              Тариф «{heroSub.name}» по специальной цене
            </Text>
            <View style={styles.promoBannerPrices}>
              <Text style={styles.promoBannerOld}>
                {heroSub.pointsPrice.toLocaleString('ru-RU')}
              </Text>
              <Text style={styles.promoBannerNew}>
                {heroPromo.promoPrice.toLocaleString('ru-RU')}
              </Text>
              <Text style={styles.promoBannerUnit}>Альфа баллов</Text>
            </View>
          </View>
        )}

        {SUBSCRIPTIONS.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            promo={promoBySub[sub.id]}
            isActive={user.currentSubscription === sub.id}
            onPress={() =>
              navigation.navigate('SubscriptionDetails', {
                subscriptionId: sub.id,
              })
            }
          />
        ))}
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
  balanceBlock: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 18,
  },
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.success,
  },
  discountIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  discountIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  discountTitle: {
    color: colors.success,
    fontWeight: '800',
    fontSize: 14,
  },
  discountSubtitle: {
    color: colors.text,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  promoBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.warning,
    marginBottom: 18,
  },
  promoBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  promoBannerLabel: {
    color: colors.warning,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  promoBannerCountdown: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  promoBannerTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  promoBannerPrices: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  promoBannerOld: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '700',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  promoBannerNew: {
    fontSize: 24,
    color: colors.warning,
    fontWeight: '900',
  },
  promoBannerUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default SubscriptionsScreen;
