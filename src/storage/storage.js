import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USERS: '@alfastat:users',
  CURRENT_USER_ID: '@alfastat:currentUserId',
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

  async clearAll() {
    await AsyncStorage.multiRemove([KEYS.USERS, KEYS.CURRENT_USER_ID]);
  },
};
