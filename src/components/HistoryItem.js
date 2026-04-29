import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const formatDate = (ts) => {
  const d = new Date(ts);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year} · ${hours}:${minutes}`;
};

const HistoryItem = ({ item }) => {
  const isPurchase = item.type === 'purchase';
  const isWelcome = item.type === 'welcome';
  const isDaily = item.type === 'daily';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          ) : null}
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.amountsBlock}>
          {item.pointsSpent > 0 && (
            <Text style={styles.pointsSpent}>
              −{item.pointsSpent.toLocaleString('ru-RU')}
            </Text>
          )}
          {item.pointsEarned > 0 && (
            <Text style={styles.pointsEarned}>
              +{item.pointsEarned.toLocaleString('ru-RU')}
            </Text>
          )}
        </View>
      </View>

      {isPurchase && item.expiresAt ? (
        <View style={styles.expiryBlock}>
          <Text style={styles.expiryLabel}>Действует до:</Text>
          <Text style={styles.expiryValue}>{formatDate(item.expiresAt)}</Text>
        </View>
      ) : null}

      <View style={styles.tagsRow}>
        {isPurchase && (
          <View style={[styles.tag, styles.tagPurchase]}>
            <Text style={styles.tagText}>Покупка тарифа</Text>
          </View>
        )}
        {isWelcome && (
          <View style={[styles.tag, styles.tagBonus]}>
            <Text style={styles.tagText}>Регистрация</Text>
          </View>
        )}
        {isDaily && (
          <View style={[styles.tag, styles.tagBonus]}>
            <Text style={styles.tagText}>Ежедневный бонус</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    color: colors.textMuted,
  },
  amountsBlock: {
    alignItems: 'flex-end',
  },
  pointsSpent: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
  pointsEarned: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  expiryBlock: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  expiryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginRight: 6,
  },
  expiryValue: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  tagPurchase: {
    backgroundColor: colors.surfaceAlt,
  },
  tagBonus: {
    backgroundColor: colors.successLight,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default HistoryItem;
