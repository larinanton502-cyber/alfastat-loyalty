export const SUBSCRIPTIONS = [
  {
    id: 'free',
    name: 'Бесплатный план',
    price: 0,
    pointsPrice: 0,
    keys: '0',
    monthlyLimits: '0',
    extraLimits: '20 000',
    extraLimitsCost: '880 ₽',
    extraKeysPack: '—',
    extraKeyCost: '—',
    description: 'Стартовый бесплатный план для знакомства с сервисом AlfaStat.',
    features: [
      '0 ключей в тарифе',
      '0 лимитов в месяц',
      'Доп. лимиты — 20 000 (880 ₽)',
      'Без дополнительных ключей',
    ],
    cashbackPercent: 0,
  },
  {
    id: 'basic',
    name: 'Базовый',
    price: 990,
    pointsPrice: 990,
    keys: '2 000',
    monthlyLimits: '20 000',
    extraLimits: '10 000',
    extraLimitsCost: '440 ₽',
    extraKeysPack: 'от 100',
    extraKeyCost: '1 ₽ / 1 ключ',
    description: 'Базовый тариф для небольших задач и старта работы.',
    features: [
      '2 000 ключей в тарифе',
      '20 000 лимитов в месяц',
      'Доп. лимиты — 10 000 (440 ₽)',
      'Доп. пакет ключей: от 100 (1 ₽/ключ)',
    ],
    cashbackPercent: 10,
  },
  {
    id: 'starter',
    name: 'Стартовый',
    price: 2990,
    pointsPrice: 2990,
    keys: '5 000',
    monthlyLimits: '45 000',
    extraLimits: '10 000',
    extraLimitsCost: '440 ₽',
    extraKeysPack: 'от 100',
    extraKeyCost: '1 ₽ / 1 ключ',
    description: 'Расширенные возможности для активных пользователей.',
    features: [
      '5 000 ключей в тарифе',
      '45 000 лимитов в месяц',
      'Доп. лимиты — 10 000 (440 ₽)',
      'Доп. пакет ключей: от 100 (1 ₽/ключ)',
    ],
    cashbackPercent: 10,
    popular: true,
  },
  {
    id: 'advanced',
    name: 'Продвинутый',
    price: 9990,
    pointsPrice: 9990,
    keys: '12 000',
    monthlyLimits: '90 000',
    extraLimits: '10 000',
    extraLimitsCost: '440 ₽',
    extraKeysPack: 'от 100',
    extraKeyCost: '1 ₽ / 1 ключ',
    description: 'Тариф для профессиональных задач и больших объёмов.',
    features: [
      '12 000 ключей в тарифе',
      '90 000 лимитов в месяц',
      'Доп. лимиты — 10 000 (440 ₽)',
      'Доп. пакет ключей: от 100 (1 ₽/ключ)',
      'Закрытый Telegram-канал: новости, нововведения и анонсы первыми',
    ],
    cashbackPercent: 12,
    isPremium: true,
  },
  {
    id: 'corporate',
    name: 'Корпоративный',
    price: 29990,
    pointsPrice: 29990,
    keys: '30 000',
    monthlyLimits: '150 000',
    extraLimits: '10 000',
    extraLimitsCost: '440 ₽',
    extraKeysPack: 'от 100',
    extraKeyCost: '1 ₽ / 1 ключ',
    description: 'Для команд и компаний с большим объёмом работы.',
    features: [
      '30 000 ключей в тарифе',
      '150 000 лимитов в месяц',
      'Доп. лимиты — 10 000 (440 ₽)',
      'Доп. пакет ключей: от 100 (1 ₽/ключ)',
      'Закрытый Telegram-канал: новости, нововведения и анонсы первыми',
    ],
    cashbackPercent: 15,
    isPremium: true,
  },
  {
    id: 'individual',
    name: 'Индивидуальный',
    price: null,
    pointsPrice: null,
    keys: 'Неограниченно',
    monthlyLimits: 'Неограниченно',
    extraLimits: '—',
    extraLimitsCost: '—',
    extraKeysPack: '—',
    extraKeyCost: '—',
    description: 'Индивидуальные условия по запросу. Свяжитесь с менеджером.',
    features: [
      'Неограниченно ключей',
      'Неограниченно лимитов в месяц',
      'Индивидуальные условия',
      'Персональный менеджер',
      'Закрытый Telegram-канал: новости, нововведения и анонсы первыми',
    ],
    cashbackPercent: 0,
    isCustom: true,
  },
];

export const WELCOME_BONUS = 30000;
export const DAILY_BONUS = 100;

export const SUBSCRIPTION_DURATIONS = [
  { months: 1, discount: 0, label: '1 месяц' },
  { months: 3, discount: 5, label: '3 месяца', badgeText: 'выгоднее на 5%' },
  { months: 6, discount: 10, label: '6 месяцев', badgeText: 'выгоднее на 10%' },
  { months: 12, discount: 20, label: '12 месяцев', badgeText: 'выгоднее на 20%' },
];

export const TRIAL_DURATION_DAYS = 14;
export const TRIAL_SUBSCRIPTION_ID = 'advanced';

export const REFERRAL_BONUS_REFERRER = 2000;
export const REFERRAL_BONUS_REFERRED = 1000;

export const ACHIEVEMENTS = [
  {
    id: 'first_purchase',
    title: 'Первая покупка',
    description: 'Купите свою первую подписку',
    glyph: '★',
    reward: 500,
  },
  {
    id: 'big_spender',
    title: 'Большие траты',
    description: 'Потратьте суммарно 5 000 Альфа баллов',
    glyph: '◆',
    reward: 1000,
  },
  {
    id: 'loyal_user',
    title: 'Постоянный клиент',
    description: 'Получите 7 ежедневных бонусов',
    glyph: '✦',
    reward: 700,
  },
  {
    id: 'referrer',
    title: 'Друг привёл друга',
    description: 'Пригласите первого пользователя',
    glyph: '♥',
    reward: 1500,
  },
  {
    id: 'subscription_master',
    title: 'Мастер подписок',
    description: 'Купите 3 разные подписки',
    glyph: '♛',
    reward: 2000,
  },
  {
    id: 'community',
    title: 'В сообществе',
    description: 'Опубликуйте первое сообщение в форуме',
    glyph: '✎',
    reward: 300,
  },
];

export const TELEGRAM_INVITE_URL = 'https://t.me/+alfastat_premium_demo';

export const getSubscriptionById = (id) =>
  SUBSCRIPTIONS.find((s) => s.id === id) || SUBSCRIPTIONS[0];

export const calculateDurationPrice = (basePrice, months, discountPercent) => {
  const total = basePrice * months;
  const discounted = Math.round(total * (1 - discountPercent / 100));
  return { total, discounted, savings: total - discounted };
};
