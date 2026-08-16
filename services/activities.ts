import { Activity } from '../types';
import { getStore } from './localStore';

export const ActivityService = {
  async getAll(): Promise<Activity[]> {
    const store = getStore();
    return store.activities;
  },

  async getByCustomerId(customerId: string): Promise<Activity[]> {
    const store = getStore();
    return store.activities.filter(a => a.customer_id === customerId);
  }
};
