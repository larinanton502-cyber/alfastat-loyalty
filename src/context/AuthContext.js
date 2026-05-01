import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../storage/storage';
import {
  WELCOME_BONUS,
  DAILY_BONUS,
  TRIAL_DURATION_DAYS,
  TRIAL_SUBSCRIPTION_ID,
  REFERRAL_BONUS_REFERRER,
  REFERRAL_BONUS_REFERRED,
  ACHIEVEMENTS,
  getSubscriptionById,
  calculateDurationPrice,
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

const generateReferralCode = (id, name) => {
  const cleanName = (name || 'USER').toUpperCase().replace(/[^A-ZА-Я]/g, '').slice(0, 4) || 'USER';
  const tail = id.slice(-4);
  return `${cleanName}${tail}`;
};

const evaluateAchievements = (user) => {
  const newAchievements = { ...(user.achievements || {}) };
  const newHistory = [];
  let bonusPoints = 0;
  const purchases = user.history.filter((h) => h.type === 'purchase');
  const dailyBonuses = user.history.filter((h) => h.type === 'daily').length;
  const totalSpent = purchases.reduce((s, h) => s + (h.pointsSpent || 0), 0);
  const uniqueSubs = new Set(purchases.map((p) => p.subscriptionId)).size;
  const referralsCount = (user.referrals || []).length;
  const forumPostsCount = user.forumPostsCount || 0;

  const checks = [
    { id: 'first_purchase', condition: purchases.length >= 1 },
    { id: 'big_spender', condition: totalSpent >= 5000 },
    { id: 'loyal_user', condition: dailyBonuses >= 7 },
    { id: 'referrer', condition: referralsCount >= 1 },
    { id: 'subscription_master', condition: uniqueSubs >= 3 },
    { id: 'community', condition: forumPostsCount >= 1 },
  ];

  for (const { id, condition } of checks) {
    if (condition && !newAchievements[id]) {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (def) {
        newAchievements[id] = { unlockedAt: Date.now() };
        bonusPoints += def.reward;
        newHistory.push({
          id: `${Date.now()}_ach_${id}_${Math.random().toString(36).slice(2, 6)}`,
          type: 'achievement',
          title: `Достижение: ${def.title}`,
          subtitle: `${def.description} · +${def.reward} Альфа баллов`,
          pointsSpent: 0,
          pointsEarned: def.reward,
          date: Date.now(),
          achievementId: id,
        });
      }
    }
  }

  return { achievements: newAchievements, bonusPoints, newHistory };
};

const applyAchievements = (user) => {
  const { achievements, bonusPoints, newHistory } = evaluateAchievements(user);
  if (newHistory.length === 0) return user;
  return {
    ...user,
    achievements,
    balance: user.balance + bonusPoints,
    history: [...newHistory, ...user.history],
  };
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

  const register = async ({ name, email, phone, password, referralCode }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const users = await storage.getUsers();
    if (users.some((u) => u.email === trimmedEmail)) {
      throw new Error('Пользователь с таким email уже зарегистрирован');
    }

    let referrer = null;
    let referralBonus = 0;
    if (referralCode && referralCode.trim()) {
      const code = referralCode.trim().toUpperCase();
      referrer = users.find((u) => u.referralCode === code);
      if (!referrer) {
        throw new Error('Промокод не найден');
      }
      referralBonus = REFERRAL_BONUS_REFERRED;
    }

    const now = Date.now();
    const id = now.toString();
    const trialExpiry = now + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

    const initialHistory = [
      {
        id: `${now}_welcome`,
        type: 'welcome',
        title: 'Стартовый баланс',
        subtitle: 'Начислено за регистрацию',
        pointsSpent: 0,
        pointsEarned: WELCOME_BONUS,
        date: now,
      },
      {
        id: `${now}_trial`,
        type: 'trial',
        title: `Пробный период · ${TRIAL_DURATION_DAYS} дней`,
        subtitle: 'Открыт доступ ко всем премиум-функциям',
        pointsSpent: 0,
        pointsEarned: 0,
        date: now,
      },
    ];

    if (referralBonus > 0) {
      initialHistory.unshift({
        id: `${now}_refbonus`,
        type: 'referral',
        title: 'Реферальный бонус',
        subtitle: `За регистрацию по промокоду ${referrer.referralCode}`,
        pointsSpent: 0,
        pointsEarned: referralBonus,
        date: now,
      });
    }

    const newUser = {
      id,
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      password,
      balance: WELCOME_BONUS + referralBonus,
      currentSubscription: TRIAL_SUBSCRIPTION_ID,
      subscriptionExpiry: trialExpiry,
      isTrialActive: true,
      trialExpiry: trialExpiry,
      registeredAt: now,
      lastBonusDate: null,
      referralCode: generateReferralCode(id, name),
      referredBy: referrer ? referrer.id : null,
      referrals: [],
      achievements: {},
      forumPostsCount: 0,
      history: initialHistory,
    };

    if (referrer) {
      const referrerNow = Date.now();
      const updatedReferrer = {
        ...referrer,
        balance: referrer.balance + REFERRAL_BONUS_REFERRER,
        referrals: [...(referrer.referrals || []), { id, name: newUser.name, date: referrerNow }],
        history: [
          {
            id: `${referrerNow}_referral_${id}`,
            type: 'referral',
            title: 'Привлечён новый пользователь',
            subtitle: `${newUser.name} зарегистрировался по вашему промокоду`,
            pointsSpent: 0,
            pointsEarned: REFERRAL_BONUS_REFERRER,
            date: referrerNow,
          },
          ...referrer.history,
        ],
      };
      const refWithAch = applyAchievements(updatedReferrer);
      await storage.upsertUser(refWithAch);
    }

    return persist(newUser);
  };

  const login = async (email, password) => {
    const users = await storage.getUsers();
    const found = users.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!found) throw new Error('Неверный email или пароль');

    let updated = found;
    if (updated.isTrialActive && updated.trialExpiry && Date.now() > updated.trialExpiry) {
      updated = {
        ...updated,
        isTrialActive: false,
        currentSubscription:
          updated.subscriptionExpiry > Date.now() ? updated.currentSubscription : 'free',
      };
      await storage.upsertUser(updated);
    }

    await storage.setCurrentUserId(updated.id);
    setUser(updated);
    return updated;
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

  const changePassword = async ({ oldPassword, newPassword }) => {
    if (!user) return;
    if (user.password !== oldPassword) {
      throw new Error('Текущий пароль введён неверно');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Новый пароль должен быть не короче 6 символов');
    }
    if (newPassword === oldPassword) {
      throw new Error('Новый пароль не должен совпадать с текущим');
    }
    const next = { ...user, password: newPassword };
    return persist(next);
  };

  const claimDailyBonus = async () => {
    if (!user) return;
    if (isSameDay(user.lastBonusDate, Date.now())) {
      throw new Error('Ежедневный бонус уже получен сегодня');
    }
    const now = Date.now();
    let next = {
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
    next = applyAchievements(next);
    return persist(next);
  };

  const buySubscription = async (subscriptionId, months = 1, discountPercent = 0) => {
    if (!user) return;
    const sub = getSubscriptionById(subscriptionId);
    if (!sub) throw new Error('Тариф не найден');
    if (sub.isCustom || sub.pointsPrice == null) {
      throw new Error('Этот тариф оформляется по заявке через менеджера');
    }
    if (sub.pointsPrice === 0) {
      throw new Error('Бесплатный план активируется автоматически');
    }

    const { discounted, savings } = calculateDurationPrice(
      sub.pointsPrice,
      months,
      discountPercent
    );

    if (user.balance < discounted) {
      throw new Error(
        `Недостаточно Альфа баллов. Не хватает: ${discounted - user.balance}`
      );
    }

    const now = Date.now();
    const cashback = Math.round((discounted * sub.cashbackPercent) / 100);
    const expiry = now + months * 30 * 24 * 60 * 60 * 1000;

    let next = {
      ...user,
      balance: user.balance - discounted + cashback,
      currentSubscription: sub.id,
      subscriptionExpiry: expiry,
      isTrialActive: false,
      history: [
        {
          id: `${now}_purchase`,
          type: 'purchase',
          title: `Подписка «${sub.name}» · ${months} мес.`,
          subtitle:
            savings > 0
              ? `Списано ${discounted} Альфа баллов (скидка ${savings}) · Кэшбэк ${cashback}`
              : `Списано ${discounted} Альфа баллов · Кэшбэк ${cashback}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          months,
          pointsSpent: discounted,
          pointsEarned: cashback,
          discountPercent,
          savings,
          cashbackPercent: sub.cashbackPercent,
          date: now,
          expiresAt: expiry,
        },
        ...user.history,
      ],
    };
    next = applyAchievements(next);
    return persist(next);
  };

  const addForumPost = async () => {
    if (!user) return;
    let next = {
      ...user,
      forumPostsCount: (user.forumPostsCount || 0) + 1,
    };
    next = applyAchievements(next);
    return persist(next);
  };

  const canClaimDaily = user
    ? !isSameDay(user.lastBonusDate, Date.now())
    : false;

  const isPremiumActive = (() => {
    if (!user) return false;
    if (!user.subscriptionExpiry || user.subscriptionExpiry < Date.now()) return false;
    const sub = getSubscriptionById(user.currentSubscription);
    return sub && sub.isPremium === true;
  })();

  const trialDaysLeft = (() => {
    if (!user || !user.isTrialActive || !user.trialExpiry) return 0;
    const ms = user.trialExpiry - Date.now();
    return ms > 0 ? Math.ceil(ms / (24 * 60 * 60 * 1000)) : 0;
  })();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        canClaimDaily,
        isPremiumActive,
        trialDaysLeft,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        claimDailyBonus,
        buySubscription,
        addForumPost,
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
