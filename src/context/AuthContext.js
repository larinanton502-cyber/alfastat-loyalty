import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../storage/storage';
import {
  WELCOME_BONUS,
  DAILY_BONUS,
  SUBSCRIPTION_DURATION_DAYS,
  getSubscriptionById,
} from '../constants/subscriptions';

const AuthContext = createContext(null);

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const current = await storage.getCurrentUser();
      setUser(current);
      setLoading(false);
    })();
  }, []);

  const persist = async (next) => {
    await storage.upsertUser(next);
    await storage.setCurrentUserId(next.id);
    setUser(next);
    return next;
  };

  const register = async ({ name, email, phone, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const users = await storage.getUsers();
    if (users.some((u) => u.email === trimmedEmail)) {
      throw new Error('Пользователь с таким email уже зарегистрирован');
    }
    const now = Date.now();
    const newUser = {
      id: now.toString(),
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      password,
      balance: WELCOME_BONUS,
      currentSubscription: 'free',
      subscriptionExpiry: null,
      registeredAt: now,
      lastBonusDate: null,
      history: [
        {
          id: `${now}_welcome`,
          type: 'welcome',
          title: 'Приветственный бонус',
          subtitle: 'Начислено за регистрацию',
          pointsSpent: 0,
          pointsEarned: WELCOME_BONUS,
          date: now,
        },
      ],
    };
    return persist(newUser);
  };

  const login = async (email, password) => {
    const users = await storage.getUsers();
    const found = users.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!found) throw new Error('Неверный email или пароль');
    await storage.setCurrentUserId(found.id);
    setUser(found);
    return found;
  };

  const logout = async () => {
    await storage.setCurrentUserId(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const next = { ...user, ...updates };
    return persist(next);
  };

  const claimDailyBonus = async () => {
    if (!user) return;
    if (isSameDay(user.lastBonusDate, Date.now())) {
      throw new Error('Ежедневный бонус уже получен сегодня');
    }
    const now = Date.now();
    const next = {
      ...user,
      balance: user.balance + DAILY_BONUS,
      lastBonusDate: now,
      history: [
        {
          id: `${now}_daily`,
          type: 'daily',
          title: 'Ежедневный бонус',
          subtitle: 'Спасибо, что заходите каждый день!',
          pointsSpent: 0,
          pointsEarned: DAILY_BONUS,
          date: now,
        },
        ...user.history,
      ],
    };
    return persist(next);
  };

  const buySubscription = async (subscriptionId) => {
    if (!user) return;
    const sub = getSubscriptionById(subscriptionId);
    if (!sub) throw new Error('Тариф не найден');
    if (sub.isCustom || sub.pointsPrice == null) {
      throw new Error('Этот тариф оформляется по заявке через менеджера');
    }
    if (sub.pointsPrice === 0) {
      throw new Error('Бесплатный план активируется автоматически');
    }
    if (user.balance < sub.pointsPrice) {
      throw new Error(
        `Недостаточно баллов. Не хватает: ${sub.pointsPrice - user.balance}`
      );
    }

    const now = Date.now();
    const cashback = Math.round((sub.pointsPrice * sub.cashbackPercent) / 100);
    const expiry = now + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000;

    const next = {
      ...user,
      balance: user.balance - sub.pointsPrice + cashback,
      currentSubscription: sub.id,
      subscriptionExpiry: expiry,
      history: [
        {
          id: `${now}_purchase`,
          type: 'purchase',
          title: `Подписка «${sub.name}»`,
          subtitle: `Списано ${sub.pointsPrice} баллов · Кэшбэк ${cashback}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          pointsSpent: sub.pointsPrice,
          pointsEarned: cashback,
          cashbackPercent: sub.cashbackPercent,
          date: now,
          expiresAt: expiry,
        },
        ...user.history,
      ],
    };
    return persist(next);
  };

  const canClaimDaily = user
    ? !isSameDay(user.lastBonusDate, Date.now())
    : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        canClaimDaily,
        register,
        login,
        logout,
        updateProfile,
        claimDailyBonus,
        buySubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
