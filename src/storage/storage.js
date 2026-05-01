import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USERS: '@alfastat:users',
  CURRENT_USER_ID: '@alfastat:currentUserId',
  ONBOARDING_SEEN: '@alfastat:onboardingSeen',
  FORUM_POSTS: '@alfastat:forumPosts',
};

const generateReferralCode = (id, name) => {
  const cleanName = (name || 'USER')
    .toUpperCase()
    .replace(/[^A-ZА-Я]/g, '')
    .slice(0, 4) || 'USER';
  const tail = String(id).slice(-4);
  return `${cleanName}${tail}`;
};

const migrateUser = (user) => {
  if (!user) return user;
  const out = { ...user };
  if (!out.referralCode) {
    out.referralCode = generateReferralCode(out.id, out.name);
  }
  if (!Array.isArray(out.referrals)) out.referrals = [];
  if (!out.achievements || typeof out.achievements !== 'object') {
    out.achievements = {};
  }
  if (typeof out.forumPostsCount !== 'number') out.forumPostsCount = 0;
  if (typeof out.isTrialActive !== 'boolean') out.isTrialActive = false;
  if (!Array.isArray(out.history)) out.history = [];
  if (typeof out.balance !== 'number') out.balance = 0;
  if (!out.currentSubscription) out.currentSubscription = 'free';
  if (typeof out.hasCard !== 'boolean') {
    out.hasCard = true;
    out.cardIssuedAt = out.cardIssuedAt || out.registeredAt || Date.now();
  }
  return out;
};

export const storage = {
  async getUsers() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USERS);
      const list = data ? JSON.parse(data) : [];
      const migrated = list.map(migrateUser);
      const changed = migrated.some(
        (u, i) => JSON.stringify(u) !== JSON.stringify(list[i])
      );
      if (changed) {
        await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(migrated));
      }
      return migrated;
    } catch (e) {
      return [];
    }
  },

  async saveUsers(users) {
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  async getCurrentUserId() {
    return AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
  },

  async setCurrentUserId(id) {
    if (id) {
      await AsyncStorage.setItem(KEYS.CURRENT_USER_ID, id);
    } else {
      await AsyncStorage.removeItem(KEYS.CURRENT_USER_ID);
    }
  },

  async getCurrentUser() {
    const id = await this.getCurrentUserId();
    if (!id) return null;
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  async upsertUser(user) {
    const users = await this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    await this.saveUsers(users);
    return user;
  },

  async getOnboardingSeen() {
    const v = await AsyncStorage.getItem(KEYS.ONBOARDING_SEEN);
    return v === '1';
  },

  async setOnboardingSeen() {
    await AsyncStorage.setItem(KEYS.ONBOARDING_SEEN, '1');
  },

  async getForumPosts() {
    try {
      const data = await AsyncStorage.getItem(KEYS.FORUM_POSTS);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  async saveForumPosts(posts) {
    await AsyncStorage.setItem(KEYS.FORUM_POSTS, JSON.stringify(posts));
  },

  async clearAll() {
    await AsyncStorage.multiRemove([
      KEYS.USERS,
      KEYS.CURRENT_USER_ID,
      KEYS.ONBOARDING_SEEN,
      KEYS.FORUM_POSTS,
    ]);
  },
};
