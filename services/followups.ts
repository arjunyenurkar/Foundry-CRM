import { FollowUp, FollowUpStatus } from '../types';
import { getStore, saveStore, generateCode, logActivity } from './localStore';

export const FollowUpService = {
  async getAll(): Promise<FollowUp[]> {
    const store = getStore();
    return store.followUps;
  },

  async getById(id: string): Promise<FollowUp | undefined> {
    const store = getStore();
    return store.followUps.find(f => f.id === id);
  },

  async getByCustomerId(customerId: string): Promise<FollowUp[]> {
    const store = getStore();
    return store.followUps.filter(f => f.customer_id === customerId);
  },

  async create(followUpData: Omit<FollowUp, 'id' | 'follow_up_code' | 'created_at'>): Promise<FollowUp> {
    const store = getStore();
    const newId = `fol-${Date.now()}`;
    const newCode = generateCode('FOL', store.followUps);

    const newFollowUp: FollowUp = {
      ...followUpData,
      id: newId,
      follow_up_code: newCode,
      created_at: new Date().toISOString(),
    };

    store.followUps.unshift(newFollowUp);
    
    // Update Customer next follow up date and last contact date
    const cIndex = store.customers.findIndex(c => c.id === followUpData.customer_id);
    if (cIndex !== -1) {
      store.customers[cIndex].last_contact_date = new Date().toISOString();
      if (followUpData.status === 'Scheduled') {
        store.customers[cIndex].next_follow_up_date = followUpData.follow_up_date;
      } else if (followUpData.next_follow_up_date) {
        store.customers[cIndex].next_follow_up_date = followUpData.next_follow_up_date;
      }
    }

    saveStore(store);
    logActivity(followUpData.customer_id, 'followup', newId, newCode, `Follow-up ${newCode} (${followUpData.follow_up_type}) scheduled.`);

    return newFollowUp;
  },

  async update(id: string, updates: Partial<FollowUp>): Promise<FollowUp> {
    const store = getStore();
    const index = store.followUps.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Follow-up not found');

    const oldVal = store.followUps[index];
    const updatedFollowUp = {
      ...oldVal,
      ...updates
    };

    store.followUps[index] = updatedFollowUp;

    // Sync dates with customer
    const cIndex = store.customers.findIndex(c => c.id === oldVal.customer_id);
    if (cIndex !== -1) {
      if (updates.status === 'Completed' && updates.next_follow_up_date) {
        store.customers[cIndex].next_follow_up_date = updates.next_follow_up_date;
        store.customers[cIndex].last_contact_date = new Date().toISOString();
      } else if (updates.follow_up_date && updatedFollowUp.status === 'Scheduled') {
        store.customers[cIndex].next_follow_up_date = updates.follow_up_date;
      }
    }

    saveStore(store);

    if (updates.status && updates.status !== oldVal.status) {
      logActivity(
        oldVal.customer_id,
        'followup',
        id,
        oldVal.follow_up_code,
        `Follow-up status changed from ${oldVal.status} to ${updates.status}.`,
        'status_change'
      );
    } else {
      logActivity(oldVal.customer_id, 'followup', id, oldVal.follow_up_code, `Follow-up details updated.`, 'update');
    }

    return updatedFollowUp;
  },

  async delete(id: string): Promise<void> {
    const store = getStore();
    const index = store.followUps.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Follow-up not found');

    const fol = store.followUps[index];
    store.followUps = store.followUps.filter(f => f.id !== id);
    saveStore(store);

    logActivity(fol.customer_id, 'followup', id, fol.follow_up_code, `Follow-up ${fol.follow_up_code} deleted.`, 'delete');
  }
};
