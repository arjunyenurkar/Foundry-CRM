import { Customer } from '../types';
import { supabase } from '../lib/supabaseClient';
import { generateCode, logActivity } from './localStore';

export const CustomerService = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers from Supabase:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Customer | undefined> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching customer by id:', error);
      return undefined;
    }
    return data || undefined;
  },

  async create(customerData: Omit<Customer, 'id' | 'customer_code' | 'created_at'>): Promise<Customer> {
    // Generate next customer code based on highest in DB
    const existing = await this.getAll();
    const newCode = generateCode('CUS', existing);

    const cleanCustomerData = {
      ...customerData,
      sales_person_id: customerData.sales_person_id && customerData.sales_person_id.trim() !== '' ? customerData.sales_person_id : null,
      customer_code: newCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('customers')
      .insert(cleanCustomerData)
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw new Error(error.message);
    }

    await logActivity(
      data.id,
      'customer',
      data.id,
      data.customer_code,
      `Customer/Prospect '${customerData.company_name}' was registered.`
    );

    return data;
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const current = await this.getById(id);

    const { data, error } = await supabase
      .from('customers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw new Error(error.message);
    }

    if (current) {
      if (updates.status && updates.status !== current.status) {
        await logActivity(
          id,
          'customer',
          id,
          current.customer_code,
          `Customer status changed from ${current.status} to ${updates.status}.`,
          'status_change'
        );
      } else {
        await logActivity(
          id,
          'customer',
          id,
          current.customer_code,
          `Customer profile updated.`,
          'update'
        );
      }
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const current = await this.getById(id);

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw new Error(error.message);
    }

    if (current) {
      await logActivity(
        id,
        'customer',
        id,
        current.customer_code,
        `Customer '${current.company_name}' deleted.`,
        'delete'
      );
    }
  },

  async convertLead(id: string): Promise<Customer> {
    return this.update(id, { status: 'Active' });
  }
};
