import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import { notify } from '../utils/dialog';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Введите email';
    if (!password) e.password = 'Введите пароль';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      notify({ title: 'Ошибка входа', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Text style={styles.logoMark}>α</Text>
              </View>
              <Text style={styles.title}>Добро пожаловать</Text>
              <Text style={styles.subtitle}>
                Войдите в свой аккаунт AlfaStat
              </Text>
            </View>

            <View style={styles.form}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="example@mail.ru"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <TextField
              label="Пароль"
              value={password}
              onChangeText={setPassword}
              placeholder="Введите пароль"
              secureTextEntry
              secureToggle
              error={errors.password}
            />

            <PrimaryButton
              title="Войти"
              onPress={onSubmit}
              loading={loading}
              style={{ marginTop: 8 }}
            />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Нет аккаунта?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.linkText}> Зарегистрироваться</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoMark: {
    fontSize: 44,
    color: colors.textOnPrimary,
    fontWeight: '900',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
  },
  form: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LoginScreen;
