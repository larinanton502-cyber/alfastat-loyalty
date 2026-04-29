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
import { WELCOME_BONUS } from '../constants/subscriptions';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import { notify } from '../utils/dialog';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Введите имя';
    if (!form.email.trim()) e.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Некорректный email';
    if (!form.phone.trim()) e.phone = 'Введите телефон';
    if (!form.password) e.password = 'Введите пароль';
    else if (form.password.length < 6)
      e.password = 'Минимум 6 символов';
    if (form.confirm !== form.password)
      e.confirm = 'Пароли не совпадают';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
    } catch (err) {
      notify({ title: 'Ошибка регистрации', message: err.message });
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
            <Text style={styles.title}>Создание аккаунта</Text>
            <Text style={styles.subtitle}>
              После регистрации вы получите{' '}
              <Text style={styles.bonus}>{WELCOME_BONUS} бонусных баллов</Text>
            </Text>

            <View style={styles.form}>
            <TextField
              label="Имя"
              value={form.name}
              onChangeText={(v) => setField('name', v)}
              placeholder="Иван Иванов"
              error={errors.name}
            />
            <TextField
              label="Email"
              value={form.email}
              onChangeText={(v) => setField('email', v)}
              placeholder="example@mail.ru"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <TextField
              label="Телефон"
              value={form.phone}
              onChangeText={(v) => setField('phone', v)}
              placeholder="+7 (___) ___-__-__"
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <TextField
              label="Пароль"
              value={form.password}
              onChangeText={(v) => setField('password', v)}
              placeholder="Не менее 6 символов"
              secureTextEntry
              error={errors.password}
            />
            <TextField
              label="Подтверждение пароля"
              value={form.confirm}
              onChangeText={(v) => setField('confirm', v)}
              placeholder="Повторите пароль"
              secureTextEntry
              error={errors.confirm}
            />

            <PrimaryButton
              title="Зарегистрироваться"
              onPress={onSubmit}
              loading={loading}
              style={{ marginTop: 8 }}
            />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Уже есть аккаунт?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.linkText}> Войти</Text>
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 24,
    textAlign: 'center',
  },
  bonus: {
    color: colors.primary,
    fontWeight: '700',
  },
  form: {
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
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

export default RegisterScreen;
