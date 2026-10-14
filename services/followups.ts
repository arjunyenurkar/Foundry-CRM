import { FollowUp } from '../types';
import { supabase } from '../lib/supabaseClient';
import { generateCode, logActivity } from './localStore';

export const FollowUpService = {
  async getAll(): Promise<FollowUp[]> {
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .order('follow_up_date', { ascending: false });

    if (error) {
      console.error('Error fetching follow ups:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<FollowUp | undefined> {
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching follow up by id:', error);
      return undefined;
    }
    return data || undefined;
  },

  async getByCustomerId(customerId: string): Promise<FollowUp[]> {
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error fetching follow ups for customer:', error);
      return [];
    }
    return data || [];
  },

  async create(followUpData: Omit<FollowUp, 'id' | 'follow_up_code' | 'created_at'>): Promise<FollowUp> {
    const existing = await this.getAll();
    const newCode = generateCode('FOL', existing);

    // Sanitize optional UUIDs to null if empty string
    const cleanData = {
      ...followUpData,
      enquiry_id: followUpData.enquiry_id && followUpData.enquiry_id.trim() !== '' ? followUpData.enquiry_id : null,
      quotation_id: followUpData.quotation_id && followUpData.quotation_id.trim() !== '' ? followUpData.quotation_id : null,
      assigned_to: followUpData.assigned_to && followUpData.assigned_to.trim() !== '' ? followUpData.assigned_to : null,
      next_follow_up_date: followUpData.next_follow_up_date && followUpData.next_follow_up_date.trim() !== '' ? followUpData.next_follow_up_date : null,
      follow_up_code: newCode,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('follow_ups')
      .insert(cleanData)
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating follow up in Supabase:', error);
      throw new Error(error?.message || 'Failed to create follow up');
    }

    // Update customer last contact date and next follow up date
    await supabase
      .from('customers')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', followUpData.customer_id);

    await logActivity(
      followUpData.customer_id,
      'followup',
      data.id,
      newCode,
      `Follow-up ${newCode} (${followUpData.follow_up_type}) scheduled.`
    );

    return data;
  },

  async update(id: string, updates: Partial<FollowUp>): Promise<FollowUp> {
    const current = await this.getById(id);

    const { data, error } = await supabase
      .from('follow_ups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating follow up:', error);
      throw new Error(error?.message || 'Failed to update follow up');
    }

    if (current && updates.status && updates.status !== current.status) {
      await logActivity(
        current.customer_id,
        'followup',
        id,
        current.follow_up_code,
        `Follow-up status marked as ${updates.status}.`,
        'status_change'
      );
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const current = await this.getById(id);
    const { error } = await supabase.from('follow_ups').delete().eq('id', id);
    if (error) throw new Error(error.message);

    if (current) {
      await logActivity(
        current.customer_id,
        'followup',
        id,
        current.follow_up_code,
        `Follow-up ${current.follow_up_code} deleted.`,
        'delete'
      );
    }
  }
};
