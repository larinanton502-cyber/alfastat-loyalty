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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import {
  getSubscriptionById,
  ACHIEVEMENTS,
  TELEGRAM_INVITE_URL,
  REFERRAL_BONUS_REFERRER,
  REFERRAL_BONUS_REFERRED,
} from '../constants/subscriptions';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import AlfaCard from '../components/AlfaCard';
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

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile, changePassword, isPremiumActive } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) return null;
  const subscription = getSubscriptionById(user.currentSubscription);

  const purchases = user.history.filter((h) => h.type === 'purchase');
  const purchasesCount = purchases.length;
  const totalSpent = purchases.reduce((sum, h) => sum + h.pointsSpent, 0);
  const referrals = user.referrals || [];
  const unlockedAchievements = ACHIEVEMENTS.filter(
    (a) => user.achievements && user.achievements[a.id]
  );

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

  const openPasswordModal = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordModal(true);
  };

  const submitPasswordChange = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      notify({ title: 'Ошибка', message: 'Заполните все поля' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify({ title: 'Ошибка', message: 'Пароли не совпадают' });
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordModal(false);
      notify({ title: 'Готово', message: 'Пароль успешно изменён' });
    } catch (e) {
      notify({ title: 'Ошибка', message: e.message });
    } finally {
      setChangingPassword(false);
    }
  };

  const copyReferral = () => {
    const code = user.referralCode;
    if (Platform.OS === 'web' && navigator?.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        notify({
          title: 'Код скопирован',
          message: `Промокод ${code} скопирован в буфер обмена`,
        });
      });
    } else {
      notify({
        title: 'Ваш промокод',
        message: code,
      });
    }
  };

  const openTelegram = () => {
    if (!isPremiumActive) {
      notify({
        title: 'Доступ только для премиум',
        message: 'Telegram-канал доступен пользователям тарифов «Продвинутый» и «Корпоративный»',
      });
      return;
    }
    if (Platform.OS === 'web') {
      window.open(TELEGRAM_INVITE_URL, '_blank');
    } else {
      Linking.openURL(TELEGRAM_INVITE_URL).catch(() => {
        notify({ title: 'Ошибка', message: 'Не удалось открыть ссылку' });
      });
    }
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

        <View style={styles.cardSection}>
          <View style={styles.cardSectionHeader}>
            <Text style={styles.cardSectionTitle}>Альфа-карта</Text>
            <View style={styles.activeBadge}>
              <View style={styles.activeBadgeDot} />
              <Text style={styles.activeBadgeText}>Активна</Text>
            </View>
          </View>
          <AlfaCard user={user} />

          <TouchableOpacity
            style={styles.topUpButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('TopUp')}
          >
            <View style={styles.topUpIcon}>
              <Text style={styles.topUpIconText}>+</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.topUpTitle}>Пополнить карту</Text>
              <Text style={styles.topUpSubtitle}>
                Оплата банковской картой · 1 ₽ = 1 балл
              </Text>
            </View>
            <Text style={styles.topUpArrow}>›</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{purchasesCount}</Text>
            <Text style={styles.statLabel}>Покупок</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{referrals.length}</Text>
            <Text style={styles.statLabel}>Друзей</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Текущий тариф</Text>
          <Text style={styles.subscriptionName}>{subscription.name}</Text>
          {user.isTrialActive && (
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>ПРОБНЫЙ ПЕРИОД</Text>
            </View>
          )}
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
          <Text style={styles.cardTitle}>Реферальная программа</Text>
          <Text style={styles.cardSubtitle}>
            Поделитесь промокодом — друг получит {REFERRAL_BONUS_REFERRED} Альфа баллов,
            вы получите {REFERRAL_BONUS_REFERRER} Альфа баллов.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={copyReferral}
            style={styles.referralCode}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.referralLabel}>Ваш промокод</Text>
              <Text style={styles.referralValue}>{user.referralCode}</Text>
            </View>
            <Text style={styles.copyIcon}>⧉</Text>
          </TouchableOpacity>
          {referrals.length > 0 && (
            <View style={styles.referralsList}>
              <Text style={styles.referralsTitle}>
                Привлечено: {referrals.length}
              </Text>
              {referrals.slice(0, 3).map((r) => (
                <Text key={r.id} style={styles.referralItem}>
                  • {r.name} · {formatDate(r.date)}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Достижения</Text>
            <Text style={styles.achievementsCount}>
              {unlockedAchievements.length} / {ACHIEVEMENTS.length}
            </Text>
          </View>
          <View style={styles.achievementsList}>
            {ACHIEVEMENTS.map((a) => {
              const unlocked =
                user.achievements && user.achievements[a.id];
              return (
                <View
                  key={a.id}
                  style={[
                    styles.achievement,
                    !unlocked && styles.achievementLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.achievementGlyph,
                      unlocked && styles.achievementGlyphActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.achievementGlyphText,
                        unlocked && styles.achievementGlyphTextActive,
                      ]}
                    >
                      {a.glyph}
                    </Text>
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text
                      style={[
                        styles.achievementTitle,
                        !unlocked && styles.achievementTitleLocked,
                      ]}
                    >
                      {a.title}
                    </Text>
                    <Text style={styles.achievementDescription}>
                      {a.description}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.achievementReward,
                      !unlocked && styles.achievementRewardLocked,
                    ]}
                  >
                    +{a.reward}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={openTelegram}
          style={[
            styles.telegramCard,
            !isPremiumActive && styles.telegramCardLocked,
          ]}
        >
          <View style={styles.telegramIcon}>
            <Text style={styles.telegramIconText}>✈</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.telegramTitle}>
              Закрытый Telegram-канал
            </Text>
            <Text style={styles.telegramSubtitle}>
              {isPremiumActive
                ? 'Эксклюзивные советы и анонсы новых функций'
                : 'Доступно для тарифов «Продвинутый» и «Корпоративный»'}
            </Text>
          </View>
          <Text style={styles.telegramArrow}>›</Text>
        </TouchableOpacity>

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
          <InfoRow
            label="Всего потрачено"
            value={`${totalSpent.toLocaleString('ru-RU')} Альфа баллов`}
          />
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SupportChat')}
          >
            <View style={styles.menuIconWrap}>
              <Text style={styles.menuIcon}>?</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Чат с поддержкой</Text>
              <Text style={styles.menuSubtitle}>
                Решение проблем и ответы на вопросы
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={openPasswordModal}
          >
            <View style={styles.menuIconWrap}>
              <Text style={styles.menuIcon}>⚿</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Сменить пароль</Text>
              <Text style={styles.menuSubtitle}>
                Безопасность аккаунта
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="Выйти из аккаунта"
          onPress={confirmLogout}
          variant="outline"
          style={{ marginTop: 14 }}
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

      <Modal visible={passwordModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setPasswordModal(false)}
          />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Смена пароля</Text>
            <TextField
              label="Текущий пароль"
              value={passwordForm.oldPassword}
              onChangeText={(v) =>
                setPasswordForm((p) => ({ ...p, oldPassword: v }))
              }
              secureTextEntry
              secureToggle
              placeholder="Введите текущий пароль"
            />
            <TextField
              label="Новый пароль"
              value={passwordForm.newPassword}
              onChangeText={(v) =>
                setPasswordForm((p) => ({ ...p, newPassword: v }))
              }
              secureTextEntry
              secureToggle
              placeholder="Не менее 6 символов"
            />
            <TextField
              label="Подтверждение нового пароля"
              value={passwordForm.confirmPassword}
              onChangeText={(v) =>
                setPasswordForm((p) => ({ ...p, confirmPassword: v }))
              }
              secureTextEntry
              secureToggle
              placeholder="Повторите новый пароль"
            />
            <View style={styles.modalActions}>
              <PrimaryButton
                title="Отмена"
                variant="ghost"
                onPress={() => setPasswordModal(false)}
                style={{ flex: 1 }}
              />
              <View style={{ width: 10 }} />
              <PrimaryButton
                title="Сменить"
                onPress={submitPasswordChange}
                loading={changingPassword}
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
  cardSection: {
    marginTop: 14,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 5,
  },
  activeBadgeText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  topUpIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topUpIconText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 26,
  },
  topUpTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  topUpSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  topUpArrow: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  cardPerks: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPerksTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardPerksText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardActionItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActionGlyph: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '900',
  },
  cardActionLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '800',
    marginTop: 4,
  },
  cardActionHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
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
  cardSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  subscriptionName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  trialBadge: {
    backgroundColor: colors.warning,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  trialBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subscriptionExpiry: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  subscriptionDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
  referralCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  referralLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  referralValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  copyIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '700',
  },
  referralsList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  referralsTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  referralItem: {
    color: colors.textMuted,
    fontSize: 12,
    marginVertical: 1,
  },
  achievementsCount: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  achievementsList: {
    marginTop: 4,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementGlyph: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementGlyphActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  achievementGlyphText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '900',
  },
  achievementGlyphTextActive: {
    color: colors.textOnPrimary,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  achievementTitleLocked: {
    color: colors.textMuted,
  },
  achievementDescription: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  achievementReward: {
    color: colors.success,
    fontWeight: '800',
    fontSize: 14,
  },
  achievementRewardLocked: {
    color: colors.textMuted,
  },
  telegramCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#229ED9',
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
  },
  telegramCardLocked: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  telegramIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  telegramIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  telegramTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  telegramSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  telegramArrow: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
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
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  menuArrow: {
    color: colors.textMuted,
    fontSize: 28,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 64,
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
