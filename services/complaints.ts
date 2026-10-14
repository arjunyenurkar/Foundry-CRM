import { Complaint } from '../types';
import { supabase } from '../lib/supabaseClient';
import { generateCode, logActivity } from './localStore';

export const ComplaintService = {
  async getAll(): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Complaint | undefined> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching complaint by id:', error);
      return undefined;
    }
    return data || undefined;
  },

  async getByCustomerId(customerId: string): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error fetching complaints for customer:', error);
      return [];
    }
    return data || [];
  },

  async create(complaintData: Omit<Complaint, 'id' | 'complaint_code' | 'created_at' | 'updated_at'>): Promise<Complaint> {
    const existing = await this.getAll();
    const newCode = generateCode('CMP', existing);

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        ...complaintData,
        complaint_code: newCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating complaint:', error);
      throw new Error(error?.message || 'Failed to register customer complaint');
    }

    await logActivity(
      complaintData.customer_id,
      'complaint',
      data.id,
      newCode,
      `Customer complaint ${newCode} was registered regarding ${complaintData.complaint_type}.`
    );

    return data;
  },

  async update(id: string, updates: Partial<Complaint>): Promise<Complaint> {
    const current = await this.getById(id);

    const { data, error } = await supabase
      .from('complaints')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating complaint:', error);
      throw new Error(error?.message || 'Failed to update complaint');
    }

    if (current && updates.status && updates.status !== current.status) {
      await logActivity(
        current.customer_id,
        'complaint',
        id,
        current.complaint_code,
        `Complaint status changed from ${current.status} to ${updates.status}.`,
        'status_change'
      );
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const current = await this.getById(id);
    const { error } = await supabase.from('complaints').delete().eq('id', id);
    if (error) throw new Error(error.message);

    if (current) {
      await logActivity(
        current.customer_id,
        'complaint',
        id,
        current.complaint_code,
        `Complaint ${current.complaint_code} deleted.`,
        'delete'
      );
    }
  }
};
