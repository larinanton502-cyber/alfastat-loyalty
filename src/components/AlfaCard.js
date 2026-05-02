import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { CARD_TIERS, getCardTier } from '../constants/subscriptions';

const formatCardNumber = (id) => {
  const padded = String(id || '0').padStart(16, '4');
  const last16 = padded.slice(-16);
  return `${last16.slice(0, 4)} ${last16.slice(4, 8)} ${last16.slice(
    8,
    12
  )} ${last16.slice(12, 16)}`;
};

const formatExpiry = (issuedAt, registeredAt) => {
  const start = issuedAt
    ? new Date(issuedAt)
    : registeredAt
    ? new Date(registeredAt)
    : new Date();
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

const AlfaCard = ({ user, totalSpent }) => {
  if (!user) return null;
  const tier =
    typeof totalSpent === 'number' ? getCardTier(totalSpent) : CARD_TIERS[0];
  const cardNumber = formatCardNumber(user.id);
  const expiry = formatExpiry(user.cardIssuedAt, user.registeredAt);
  const holder = transliterate(user.name).slice(0, 24);

  const isLightBg = tier.id === 'platinum' || tier.id === 'gold';
  const textPrimary = '#fff';
  const textSecondary = isLightBg
    ? 'rgba(255,255,255,0.75)'
    : 'rgba(255,255,255,0.7)';

  return (
    <View style={[styles.card, { backgroundColor: tier.bg }]}>
      <View
        style={[
          styles.shineTopRight,
          { backgroundColor: tier.accent, opacity: 0.18 },
        ]}
      />
      <View
        style={[
          styles.shineBottomLeft,
          { backgroundColor: tier.accent, opacity: 0.1 },
        ]}
      />

      <View style={styles.header}>
        <View>
          <Text style={[styles.brand, { color: textPrimary }]}>Альфа-карта</Text>
          <Text style={[styles.brandSubtitle, { color: textSecondary }]}>
            AlfaStat Loyalty
          </Text>
        </View>
        <View style={styles.tierBadge}>
          <Text style={[styles.tierBadgeText, { color: tier.accent }]}>
            {tier.name.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={[styles.chip, { backgroundColor: tier.chipColor }]}>
        <View style={styles.chipInner} />
      </View>

      <View style={styles.balanceBlock}>
        <Text style={[styles.balanceLabel, { color: textSecondary }]}>
          Баланс
        </Text>
        <View style={styles.balanceRow}>
          <Text style={[styles.balanceValue, { color: textPrimary }]}>
            {user.balance.toLocaleString('ru-RU')}
          </Text>
          <Text style={[styles.balanceUnit, { color: textSecondary }]}>
            Альфа баллов
          </Text>
        </View>
      </View>

      <Text style={[styles.cardNumber, { color: textPrimary }]}>
        {cardNumber}
      </Text>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.footerLabel, { color: textSecondary }]}>
            ДЕРЖАТЕЛЬ
          </Text>
          <Text style={[styles.footerValue, { color: textPrimary }]}>
            {holder || 'CARD HOLDER'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.footerLabel, { color: textSecondary }]}>
            ДЕЙСТВУЕТ ДО
          </Text>
          <Text style={[styles.footerValue, { color: textPrimary }]}>
            {expiry}
          </Text>
        </View>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>AS</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
    shadowColor: '#000',
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
  },
  shineBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brand: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tierBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  chip: {
    width: 36,
    height: 28,
    borderRadius: 6,
    marginTop: 10,
    padding: 3,
  },
  chipInner: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  balanceBlock: {
    marginTop: 6,
  },
  balanceLabel: {
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
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  balanceUnit: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  cardNumber: {
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
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default AlfaCard;
