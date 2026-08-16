import { Complaint, ComplaintStatus } from '../types';
import { getStore, saveStore, generateCode, logActivity } from './localStore';

export const ComplaintService = {
  async getAll(): Promise<Complaint[]> {
    const store = getStore();
    return store.complaints;
  },

  async getById(id: string): Promise<Complaint | undefined> {
    const store = getStore();
    return store.complaints.find(c => c.id === id);
  },

  async getByCustomerId(customerId: string): Promise<Complaint[]> {
    const store = getStore();
    return store.complaints.filter(c => c.customer_id === customerId);
  },

  async create(complaintData: Omit<Complaint, 'id' | 'complaint_code' | 'created_at' | 'updated_at'>): Promise<Complaint> {
    const store = getStore();
    const newId = `cmp-${Date.now()}`;
    const newCode = generateCode('CMP', store.complaints);

    const newComplaint: Complaint = {
      ...complaintData,
      id: newId,
      complaint_code: newCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.complaints.unshift(newComplaint);
    saveStore(store);

    logActivity(complaintData.customer_id, 'complaint', newId, newCode, `Customer complaint ${newCode} was registered regarding ${complaintData.complaint_type}.`);

    return newComplaint;
  },

  async update(id: string, updates: Partial<Complaint>): Promise<Complaint> {
    const store = getStore();
    const index = store.complaints.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Complaint not found');

    const oldVal = store.complaints[index];
    const updatedComplaint = {
      ...oldVal,
      ...updates,
      updated_at: new Date().toISOString()
    };

    store.complaints[index] = updatedComplaint;
    saveStore(store);

    if (updates.status && updates.status !== oldVal.status) {
      logActivity(
        oldVal.customer_id,
        'complaint',
        id,
        oldVal.complaint_code,
        `Complaint status changed from ${oldVal.status} to ${updates.status}.`,
        'status_change'
      );
    } else {
      logActivity(oldVal.customer_id, 'complaint', id, oldVal.complaint_code, `Complaint profile updated.`, 'update');
    }

    return updatedComplaint;
  },

  async delete(id: string): Promise<void> {
    const store = getStore();
    const index = store.complaints.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Complaint not found');

    const cmp = store.complaints[index];
    store.complaints = store.complaints.filter(c => c.id !== id);
    saveStore(store);

    logActivity(cmp.customer_id, 'complaint', id, cmp.complaint_code, `Complaint ${cmp.complaint_code} deleted.`, 'delete');
  }
};
