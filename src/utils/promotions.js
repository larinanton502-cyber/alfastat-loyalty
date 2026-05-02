import AsyncStorage from '@react-native-async-storage/async-storage';
import { PROMO_TEMPLATES } from '../constants/subscriptions';

const KEY = '@alfastat:promotions';
const HOUR_MS = 60 * 60 * 1000;

const generateFresh = (now) =>
  PROMO_TEMPLATES.map((t) => ({
    subscriptionId: t.subscriptionId,
    promoPrice: t.promoPrice,
    label: t.label,
    expiresAt: now + t.durationHours * HOUR_MS,
  }));

export const getActivePromotions = async () => {
  const now = Date.now();
  let stored = null;
  try {
    const data = await AsyncStorage.getItem(KEY);
    stored = data ? JSON.parse(data) : null;
  } catch (e) {
    stored = null;
  }

  if (!Array.isArray(stored) || stored.length === 0) {
    const fresh = generateFresh(now);
    await AsyncStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  }

  const active = stored.filter((p) => p.expiresAt > now);
  if (active.length === 0) {
    const fresh = generateFresh(now);
    await AsyncStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  }

  if (active.length < PROMO_TEMPLATES.length) {
    const presentIds = new Set(active.map((p) => p.subscriptionId));
    const missing = PROMO_TEMPLATES.filter(
      (t) => !presentIds.has(t.subscriptionId)
    ).map((t) => ({
      subscriptionId: t.subscriptionId,
      promoPrice: t.promoPrice,
      label: t.label,
      expiresAt: now + t.durationHours * HOUR_MS,
    }));
    const merged = [...active, ...missing];
    await AsyncStorage.setItem(KEY, JSON.stringify(merged));
    return merged;
  }

  return active;
};

export const formatRemaining = (expiresAt) => {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return 'завершилась';
  const h = Math.floor(ms / HOUR_MS);
  const m = Math.floor((ms % HOUR_MS) / (60 * 1000));
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return `${d} д ${rh} ч`;
  }
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
};
