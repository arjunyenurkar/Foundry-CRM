import { Activity } from '../types';
import { supabase } from '../lib/supabaseClient';

export const ActivityService = {
  async getAll(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
    return data || [];
  },

  async getByCustomerId(customerId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities for customer:', error);
      return [];
    }
    return data || [];
  }
};
