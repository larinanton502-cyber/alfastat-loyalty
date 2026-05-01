import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

const SubscriptionCard = ({ subscription, isActive, onPress }) => {
  const { name, price, pointsPrice, features, popular, isCustom } = subscription;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        isActive && styles.cardActive,
        popular && !isActive && styles.cardPopular,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.name, isActive && styles.nameActive]}>{name}</Text>
        {isActive ? (
          <View style={styles.badgeActive}>
            <Text style={styles.badgeActiveText}>Активен</Text>
          </View>
        ) : popular ? (
          <View style={styles.badgePopular}>
            <Text style={styles.badgePopularText}>Популярный</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.priceRow}>
        {isCustom ? (
          <Text style={styles.priceCustom}>По заявке</Text>
        ) : (
          <>
            <Text style={styles.price}>
              {price === 0 ? 'Бесплатно' : `${price.toLocaleString('ru-RU')} ₽`}
            </Text>
            {pointsPrice > 0 && (
              <Text style={styles.points}>
                · {pointsPrice.toLocaleString('ru-RU')} Альфа баллов
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.features}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  cardPopular: {
    borderColor: colors.primaryLight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  nameActive: {
    color: colors.primaryDark,
  },
  badgeActive: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeActiveText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  badgePopular: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePopularText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  priceCustom: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  points: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  features: {
    gap: 4,
  },
  featureRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  featureBullet: {
    color: colors.primary,
    marginRight: 8,
    fontSize: 14,
  },
  featureText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
});

export default SubscriptionCard;
