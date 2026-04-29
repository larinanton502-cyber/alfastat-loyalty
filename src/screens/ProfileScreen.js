import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { getSubscriptionById } from '../constants/subscriptions';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import { confirm, notify } from '../utils/dialog';

const formatDate = (ts) => {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear()}`;
};

const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const ProfileScreen = () => {
  const { user, logout, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  if (!user) return null;
  const subscription = getSubscriptionById(user.currentSubscription);

  const purchases = user.history.filter((h) => h.type === 'purchase');
  const purchasesCount = purchases.length;
  const totalRubSpent = purchases.reduce((sum, h) => sum + h.pointsSpent, 0);

  const openEdit = () => {
    setForm({ name: user.name, phone: user.phone });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      notify({ title: 'Ошибка', message: 'Заполните все поля' });
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    confirm({
      title: 'Выход',
      message: 'Вы уверены, что хотите выйти?',
      confirmText: 'Выйти',
      destructive: true,
      onConfirm: logout,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {user.balance.toLocaleString('ru-RU')}
            </Text>
            <Text style={styles.statLabel}>Баллов</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{purchasesCount}</Text>
            <Text style={styles.statLabel}>Покупок</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {totalRubSpent.toLocaleString('ru-RU')}
            </Text>
            <Text style={styles.statLabel}>Потрачено</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Текущий тариф</Text>
          <Text style={styles.subscriptionName}>{subscription.name}</Text>
          {user.subscriptionExpiry && (
            <Text style={styles.subscriptionExpiry}>
              Действует до {formatDate(user.subscriptionExpiry)}
            </Text>
          )}
          <Text style={styles.subscriptionDescription}>
            {subscription.description}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Личные данные</Text>
            <TouchableOpacity onPress={openEdit}>
              <Text style={styles.editLink}>Изменить</Text>
            </TouchableOpacity>
          </View>
          <InfoRow label="Имя" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Телефон" value={user.phone} />
          <InfoRow
            label="Дата регистрации"
            value={formatDate(user.registeredAt)}
          />
        </View>

        <PrimaryButton
          title="Выйти из аккаунта"
          onPress={confirmLogout}
          variant="outline"
          style={{ marginTop: 8 }}
        />
      </ScrollView>

      <Modal visible={editing} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setEditing(false)}
          />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Изменить данные</Text>
            <TextField
              label="Имя"
              value={form.name}
              onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
            />
            <TextField
              label="Телефон"
              value={form.phone}
              onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
              keyboardType="phone-pad"
            />
            <View style={styles.modalActions}>
              <PrimaryButton
                title="Отмена"
                variant="ghost"
                onPress={() => setEditing(false)}
                style={{ flex: 1 }}
              />
              <View style={{ width: 10 }} />
              <PrimaryButton
                title="Сохранить"
                onPress={saveEdit}
                loading={saving}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  avatarBlock: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: colors.textOnPrimary,
    fontSize: 36,
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subscriptionName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  subscriptionExpiry: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  subscriptionDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  rowValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  editLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,71,161,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
});

export default ProfileScreen;
