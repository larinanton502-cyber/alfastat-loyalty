import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 1400);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoMark}>α</Text>
      </View>
      <Text style={styles.title}>AlfaStat</Text>
      <Text style={styles.subtitle}>Loyalty Program</Text>
      <ActivityIndicator
        color={colors.textOnPrimary}
        style={styles.loader}
        size="small"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logoMark: {
    fontSize: 64,
    color: colors.primary,
    fontWeight: '900',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.textOnPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.accent,
    marginTop: 6,
    letterSpacing: 2,
    fontWeight: '600',
  },
  loader: {
    marginTop: 36,
  },
});

export default SplashScreen;
