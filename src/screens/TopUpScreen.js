import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { TOP_UP_PRESETS } from '../constants/subscriptions';
import PrimaryButton from '../components/PrimaryButton';
import { notify } from '../utils/dialog';

const onlyDigits = (s) => (s || '').replace(/\D/g, '');

const formatCardNumber = (raw) => {
  const d = onlyDigits(raw).slice(0, 16);
  return d.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (raw) => {
  const d = onlyDigits(raw).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};

const TopUpScreen = ({ navigation }) => {
  const { user, topUp } = useAuth();
  const [amount, setAmount] = useState('5000');
  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    holder: '',
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const numericAmount = useMemo(() => {
    const v = parseInt(onlyDigits(amount) || '0', 10);
    return Number.isFinite(v) ? v : 0;
  }, [amount]);

  const isPresetSelected = (preset) => numericAmount === preset;

  const setPreset = (p) => setAmount(String(p));

  const validate = () => {
    const e = {};
    if (numericAmount < 100) e.amount = 'Минимум 100';
    if (numericAmount > 1_000_000) e.amount = 'Максимум 1 000 000';
    const numberDigits = onlyDigits(card.number);
    if (numberDigits.length !== 16) e.number = 'Введите 16 цифр';
    const expDigits = onlyDigits(card.expiry);
    if (expDigits.length !== 4) e.expiry = 'MM/ГГ';
    else {
      const mm = parseInt(expDigits.slice(0, 2), 10);
      if (mm < 1 || mm > 12) e.expiry = 'Неверный месяц';
    }
    if (onlyDigits(card.cvc).length !== 3) e.cvc = '3 цифры';
    if (!card.holder.trim()) e.holder = 'Заполните';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const last4 = onlyDigits(card.number).slice(-4);
      await topUp({ amount: numericAmount, cardLast4: last4 });
      notify({
        title: 'Платёж принят',
        message: `На карту зачислено ${numericAmount.toLocaleString(
          'ru-RU'
        )} Альфа баллов.`,
        onClose: () => navigation.goBack(),
      });
    } catch (err) {
      notify({ title: 'Ошибка', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Текущий баланс карты</Text>
            <Text style={styles.balanceValue}>
              {user.balance.toLocaleString('ru-RU')}{' '}
              <Text style={styles.balanceUnit}>Альфа баллов</Text>
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Сумма пополнения</Text>
          <Text style={styles.sectionSubtitle}>
            1 ₽ = 1 Альфа балл. Списывается с банковской карты.
          </Text>

          <View style={styles.presetsGrid}>
            {TOP_UP_PRESETS.map((p) => (
              <View key={p} style={styles.presetCell}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setPreset(p)}
                  style={[
                    styles.presetCard,
                    isPresetSelected(p) && styles.presetCardActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetValue,
                      isPresetSelected(p) && styles.presetValueActive,
                    ]}
                  >
                    {p.toLocaleString('ru-RU')}
                  </Text>
                  <Text
                    style={[
                      styles.presetUnit,
                      isPresetSelected(p) && styles.presetUnitActive,
                    ]}
                  >
                    баллов
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.customWrap}>
            <Text style={styles.fieldLabel}>Или введите сумму</Text>
            <TextInput
              value={amount}
              onChangeText={(v) => setAmount(onlyDigits(v))}
              keyboardType="numeric"
              style={[styles.input, errors.amount && styles.inputError]}
              placeholder="Сумма"
              placeholderTextColor={colors.textMuted}
            />
            {errors.amount ? (
              <Text style={styles.errorText}>{errors.amount}</Text>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Способ оплаты</Text>
          <Text style={styles.sectionSubtitle}>
            Реквизиты карты — данные передаются по защищённому соединению.
          </Text>

          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.cardBrandPlaceholder}>
                <Text style={styles.cardBrandText}>VISA</Text>
              </View>
              <Text style={styles.paymentTitle}>Банковская карта</Text>
            </View>

            <Text style={styles.fieldLabel}>Номер карты</Text>
            <TextInput
              value={card.number}
              onChangeText={(v) =>
                setCard((p) => ({ ...p, number: formatCardNumber(v) }))
              }
              keyboardType="numeric"
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, errors.number && styles.inputError]}
              maxLength={19}
            />
            {errors.number ? (
              <Text style={styles.errorText}>{errors.number}</Text>
            ) : null}

            <View style={styles.row2}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>Срок действия</Text>
                <TextInput
                  value={card.expiry}
                  onChangeText={(v) =>
                    setCard((p) => ({ ...p, expiry: formatExpiry(v) }))
                  }
                  keyboardType="numeric"
                  placeholder="MM/ГГ"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, errors.expiry && styles.inputError]}
                  maxLength={5}
                />
                {errors.expiry ? (
                  <Text style={styles.errorText}>{errors.expiry}</Text>
                ) : null}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.fieldLabel}>CVC / CVV</Text>
                <TextInput
                  value={card.cvc}
                  onChangeText={(v) =>
                    setCard((p) => ({ ...p, cvc: onlyDigits(v).slice(0, 3) }))
                  }
                  keyboardType="numeric"
                  placeholder="000"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, errors.cvc && styles.inputError]}
                  maxLength={3}
                  secureTextEntry
                />
                {errors.cvc ? (
                  <Text style={styles.errorText}>{errors.cvc}</Text>
                ) : null}
              </View>
            </View>

            <Text style={styles.fieldLabel}>Имя держателя</Text>
            <TextInput
              value={card.holder}
              onChangeText={(v) =>
                setCard((p) => ({ ...p, holder: v.toUpperCase() }))
              }
              placeholder="IVAN IVANOV"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, errors.holder && styles.inputError]}
              autoCapitalize="characters"
            />
            {errors.holder ? (
              <Text style={styles.errorText}>{errors.holder}</Text>
            ) : null}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Сумма списания</Text>
              <Text style={styles.summaryValue}>
                {numericAmount.toLocaleString('ru-RU')} ₽
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>К зачислению</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                +{numericAmount.toLocaleString('ru-RU')} баллов
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Баланс после</Text>
              <Text style={styles.summaryValue}>
                {(user.balance + numericAmount).toLocaleString('ru-RU')} баллов
              </Text>
            </View>
          </View>

          <PrimaryButton
            title={`Оплатить ${numericAmount.toLocaleString('ru-RU')} ₽`}
            onPress={submit}
            loading={processing}
            disabled={numericAmount < 100}
            style={{ marginTop: 8 }}
          />

          <Text style={styles.disclaimer}>
            Оплата производится через защищённый платёжный шлюз.
            Данные карты не сохраняются в приложении.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  balanceLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: colors.textOnPrimary,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  balanceUnit: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  presetCell: {
    width: '33.333%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  presetCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  presetCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  presetValueActive: {
    color: colors.textOnPrimary,
  },
  presetUnit: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  presetUnitActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  customWrap: {
    marginTop: 8,
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 4,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    color: colors.text,
    fontSize: 15,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 11,
    marginTop: 3,
  },
  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardBrandPlaceholder: {
    backgroundColor: '#1A1F71',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  cardBrandText: {
    color: '#F7B600',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  row2: {
    flexDirection: 'row',
  },
  summaryCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});

export default TopUpScreen;
