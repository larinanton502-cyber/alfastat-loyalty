import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import {
  getSubscriptionById,
  SUBSCRIPTION_DURATIONS,
  calculateDurationPrice,
} from '../constants/subscriptions';
import PrimaryButton from '../components/PrimaryButton';
import { confirm, notify } from '../utils/dialog';

const Row = ({ label, value, accent }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, accent && { color: colors.success }]}>
      {value}
    </Text>
  </View>
);

const SubscriptionDetailsScreen = ({ route, navigation }) => {
  const { subscriptionId } = route.params;
  const { user, buySubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(SUBSCRIPTION_DURATIONS[0]);

  const sub = getSubscriptionById(subscriptionId);
  const isActive = user?.currentSubscription === sub.id;
  const canBuy = !sub.isCustom && sub.pointsPrice > 0;

  const { total, discounted, savings } =
    sub.pointsPrice && canBuy
      ? calculateDurationPrice(sub.pointsPrice, duration.months, duration.discount)
      : { total: 0, discounted: 0, savings: 0 };

  const cashback = canBuy
    ? Math.round((discounted * sub.cashbackPercent) / 100)
    : 0;

  const handleBuy = () => {
    confirm({
      title: 'Подтверждение покупки',
      message: `Тариф «${sub.name}» на ${duration.label}\nСписать: ${discounted.toLocaleString(
        'ru-RU'
      )} Альфа баллов${
        savings > 0 ? `\nСкидка: ${savings.toLocaleString('ru-RU')}` : ''
      }\nКэшбэк: ${cashback} Альфа баллов (${sub.cashbackPercent}%)`,
      confirmText: 'Купить',
      onConfirm: async () => {
        setLoading(true);
        try {
          await buySubscription(sub.id, duration.months, duration.discount);
          notify({
            title: 'Покупка успешна',
            message: `Тариф «${sub.name}» активирован на ${duration.label}.\nНачислено ${cashback} Альфа баллов кэшбэка.`,
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
                {sub.pointsPrice.toLocaleString('ru-RU')} Альфа баллов / мес.
              </Text>
            )}
          </View>
        )}

        <Text style={styles.description}>{sub.description}</Text>

        {canBuy && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Выберите длительность</Text>
            <Text style={styles.cardSubtitle}>
              При оплате на 6–12 месяцев — скидка до 20%
            </Text>
            <View style={styles.durationsList}>
              {SUBSCRIPTION_DURATIONS.map((d) => {
                const isSelected = d.months === duration.months;
                return (
                  <TouchableOpacity
                    key={d.months}
                    activeOpacity={0.85}
                    onPress={() => setDuration(d)}
                    style={[
                      styles.durationOption,
                      isSelected && styles.durationOptionActive,
                    ]}
                  >
                    <View style={styles.durationLeft}>
                      <View
                        style={[
                          styles.radio,
                          isSelected && styles.radioActive,
                        ]}
                      >
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.durationLabel,
                            isSelected && styles.durationLabelActive,
                          ]}
                        >
                          {d.label}
                        </Text>
                        {d.badgeText && (
                          <Text style={styles.durationBadge}>
                            {d.badgeText}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.durationPrice,
                        isSelected && styles.durationPriceActive,
                      ]}
                    >
                      {calculateDurationPrice(
                        sub.pointsPrice,
                        d.months,
                        d.discount
                      ).discounted.toLocaleString('ru-RU')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

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
              value={`${user.balance.toLocaleString('ru-RU')} Альфа баллов`}
            />
            <Row
              label={`${sub.pointsPrice.toLocaleString('ru-RU')} × ${duration.months} мес.`}
              value={`${total.toLocaleString('ru-RU')} Альфа баллов`}
            />
            {savings > 0 && (
              <Row
                label={`Скидка ${duration.discount}%`}
                value={`−${savings.toLocaleString('ru-RU')}`}
                accent
              />
            )}
            <Row
              label="К оплате"
              value={`${discounted.toLocaleString('ru-RU')} Альфа баллов`}
            />
            <Row
              label={`Кэшбэк (${sub.cashbackPercent}%)`}
              value={`+${cashback.toLocaleString('ru-RU')} Альфа баллов`}
              accent
            />
            <View style={styles.divider} />
            <Row
              label="Баланс после покупки"
              value={`${(
                user.balance -
                discounted +
                cashback
              ).toLocaleString('ru-RU')} Альфа баллов`}
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
              user.balance < discounted
                ? `Не хватает ${(discounted - user.balance).toLocaleString('ru-RU')} Альфа баллов`
                : `Купить за ${discounted.toLocaleString('ru-RU')} Альфа баллов`
            }
            onPress={handleBuy}
            disabled={user.balance < discounted}
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
    flexWrap: 'wrap',
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
    fontSize: 13,
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
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
  durationsList: {
    marginTop: 4,
  },
  durationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 8,
  },
  durationOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  durationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  durationLabelActive: {
    color: colors.primaryDark,
  },
  durationBadge: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '700',
    marginTop: 2,
  },
  durationPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  durationPriceActive: {
    color: colors.primary,
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
