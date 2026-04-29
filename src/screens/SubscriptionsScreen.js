import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { SUBSCRIPTIONS } from '../constants/subscriptions';
import SubscriptionCard from '../components/SubscriptionCard';

const SubscriptionsScreen = ({ navigation }) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>Доступно баллов</Text>
          <Text style={styles.balanceValue}>
            {user.balance.toLocaleString('ru-RU')}
          </Text>
        </View>

        <Text style={styles.heading}>Тарифы AlfaStat</Text>
        <Text style={styles.description}>
          Выберите подходящий тариф. Оплатите баллами и получите кэшбэк.
        </Text>

        {SUBSCRIPTIONS.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
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
});

export default SubscriptionsScreen;
