import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const formatCardNumber = (id) => {
  const padded = String(id || '0').padStart(16, '4');
  const last16 = padded.slice(-16);
  return `${last16.slice(0, 4)} ${last16.slice(4, 8)} ${last16.slice(
    8,
    12
  )} ${last16.slice(12, 16)}`;
};

const formatExpiry = (registeredAt) => {
  const start = registeredAt ? new Date(registeredAt) : new Date();
  const expiry = new Date(start);
  expiry.setFullYear(expiry.getFullYear() + 5);
  const mm = (expiry.getMonth() + 1).toString().padStart(2, '0');
  const yy = expiry.getFullYear().toString().slice(-2);
  return `${mm}/${yy}`;
};

const transliterate = (name) => {
  const map = {
    а: 'A', б: 'B', в: 'V', г: 'G', д: 'D', е: 'E', ё: 'E', ж: 'ZH',
    з: 'Z', и: 'I', й: 'I', к: 'K', л: 'L', м: 'M', н: 'N', о: 'O',
    п: 'P', р: 'R', с: 'S', т: 'T', у: 'U', ф: 'F', х: 'KH', ц: 'TS',
    ч: 'CH', ш: 'SH', щ: 'SCH', ъ: '', ы: 'Y', ь: '', э: 'E', ю: 'YU',
    я: 'YA',
  };
  return (name || '')
    .toLowerCase()
    .split('')
    .map((ch) => (map[ch] !== undefined ? map[ch] : ch))
    .join('')
    .toUpperCase();
};

const AlfaCard = ({ user }) => {
  if (!user) return null;
  const cardNumber = formatCardNumber(user.id);
  const expiry = formatExpiry(user.registeredAt);
  const holder = transliterate(user.name).slice(0, 24);

  return (
    <View style={styles.card}>
      <View style={styles.shineTopRight} />
      <View style={styles.shineBottomLeft} />

      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Альфа-карта</Text>
          <Text style={styles.brandSubtitle}>AlfaStat Loyalty</Text>
        </View>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>AS</Text>
        </View>
      </View>

      <View style={styles.chip}>
        <View style={styles.chipInner} />
      </View>

      <View style={styles.balanceBlock}>
        <Text style={styles.balanceLabel}>Баланс</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceValue}>
            {user.balance.toLocaleString('ru-RU')}
          </Text>
          <Text style={styles.balanceUnit}>Альфа баллов</Text>
        </View>
      </View>

      <Text style={styles.cardNumber}>{cardNumber}</Text>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.footerLabel}>ДЕРЖАТЕЛЬ</Text>
          <Text style={styles.footerValue}>{holder || 'CARD HOLDER'}</Text>
        </View>
        <View>
          <Text style={styles.footerLabel}>ДЕЙСТВУЕТ ДО</Text>
          <Text style={styles.footerValue}>{expiry}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    minHeight: 230,
    justifyContent: 'space-between',
  },
  shineTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primaryLight,
    opacity: 0.18,
  },
  shineBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primary,
    opacity: 0.25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brand: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  chip: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#E0C175',
    marginTop: 10,
    padding: 3,
  },
  chipInner: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: '#C9A856',
    borderWidth: 1,
    borderColor: '#A5862C',
  },
  balanceBlock: {
    marginTop: 6,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  balanceUnit: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default AlfaCard;
