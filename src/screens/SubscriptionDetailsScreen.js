import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { getSubscriptionById } from '../constants/subscriptions';
import PrimaryButton from '../components/PrimaryButton';
import { confirm, notify } from '../utils/dialog';

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const SubscriptionDetailsScreen = ({ route, navigation }) => {
  const { subscriptionId } = route.params;
  const { user, buySubscription } = useAuth();
  const [loading, setLoading] = useState(false);

  const sub = getSubscriptionById(subscriptionId);
  const isActive = user?.currentSubscription === sub.id;
  const canBuy = !isActive && !sub.isCustom && sub.pointsPrice > 0;
  const cashback = sub.pointsPrice
    ? Math.round((sub.pointsPrice * sub.cashbackPercent) / 100)
    : 0;

  const handleBuy = () => {
    confirm({
      title: 'Подтверждение покупки',
      message: `Тариф «${sub.name}»\nСписать: ${sub.pointsPrice.toLocaleString('ru-RU')} баллов\nКэшбэк: ${cashback} баллов (${sub.cashbackPercent}%)`,
      confirmText: 'Купить',
      onConfirm: async () => {
        setLoading(true);
        try {
          await buySubscription(sub.id);
          notify({
            title: 'Покупка успешна',
            message: `Тариф «${sub.name}» активирован.\nНачислено ${cashback} баллов кэшбэка.`,
            onClose: () => navigation.goBack(),
          });
        } catch (e) {
          notify({ title: 'Ошибка', message: e.message });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.name}>{sub.name}</Text>
        {sub.isCustom ? (
          <Text style={styles.priceCustom}>По заявке</Text>
        ) : (
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {sub.price === 0
                ? 'Бесплатно'
                : `${sub.price.toLocaleString('ru-RU')} ₽`}
            </Text>
            {sub.pointsPrice > 0 && (
              <Text style={styles.points}>
                {sub.pointsPrice.toLocaleString('ru-RU')} баллов
              </Text>
            )}
          </View>
        )}

        <Text style={styles.description}>{sub.description}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Условия тарифа</Text>
          <Row label="Количество ключей" value={sub.keys} />
          <Row label="Лимиты в месяц" value={sub.monthlyLimits} />
          <Row label="Доп. лимиты" value={sub.extraLimits} />
          <Row label="Стоимость доп. лимитов" value={sub.extraLimitsCost} />
          <Row label="Доп. пакет ключей" value={sub.extraKeysPack} />
          <Row label="Стоимость доп. ключей" value={sub.extraKeyCost} />
        </View>

        {canBuy && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Расчёт</Text>
            <Row
              label="Ваш баланс"
              value={`${user.balance.toLocaleString('ru-RU')} баллов`}
            />
            <Row
              label="Стоимость"
              value={`${sub.pointsPrice.toLocaleString('ru-RU')} баллов`}
            />
            <Row
              label={`Кэшбэк (${sub.cashbackPercent}%)`}
              value={`+${cashback.toLocaleString('ru-RU')} баллов`}
            />
            <View style={styles.divider} />
            <Row
              label="Баланс после покупки"
              value={`${(
                user.balance -
                sub.pointsPrice +
                cashback
              ).toLocaleString('ru-RU')} баллов`}
            />
          </View>
        )}

        {isActive && (
          <View style={[styles.card, styles.activeNote]}>
            <Text style={styles.activeNoteText}>
              Это ваш текущий активный тариф
            </Text>
          </View>
        )}

        {sub.isCustom && (
          <View style={[styles.card, styles.activeNote]}>
            <Text style={styles.activeNoteText}>
              Индивидуальный тариф оформляется по заявке через менеджера AlfaStat
            </Text>
          </View>
        )}

        {canBuy && (
          <PrimaryButton
            title={
              user.balance < sub.pointsPrice
                ? `Не хватает ${(sub.pointsPrice - user.balance).toLocaleString('ru-RU')} баллов`
                : `Купить за ${sub.pointsPrice.toLocaleString('ru-RU')} баллов`
            }
            onPress={handleBuy}
            disabled={user.balance < sub.pointsPrice}
            loading={loading}
            style={{ marginTop: 8 }}
          />
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
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
    marginBottom: 6,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  priceCustom: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
    marginBottom: 6,
  },
  points: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: 13,
    flex: 1,
  },
  rowValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  activeNote: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
    alignItems: 'center',
  },
  activeNoteText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default SubscriptionDetailsScreen;
