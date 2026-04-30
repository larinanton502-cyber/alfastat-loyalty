import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USERS: '@alfastat:users',
  CURRENT_USER_ID: '@alfastat:currentUserId',
  ONBOARDING_SEEN: '@alfastat:onboardingSeen',
  FORUM_POSTS: '@alfastat:forumPosts',
};

export const storage = {
  async getUsers() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : [];
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
