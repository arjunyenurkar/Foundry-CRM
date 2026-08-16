import { Notification } from '../types';
import { getStore, saveStore } from './localStore';

export const NotificationService = {
  async getAll(): Promise<Notification[]> {
    const store = getStore();
    return store.notifications;
  },

  async getUnread(): Promise<Notification[]> {
    const store = getStore();
    return store.notifications.filter(n => !n.read);
  },

  async markAsRead(id: string): Promise<void> {
    const store = getStore();
    const notification = store.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      saveStore(store);
    }
  },

  async markAllAsRead(): Promise<void> {
    const store = getStore();
    store.notifications.forEach(n => n.read = true);
    saveStore(store);
  }
};
