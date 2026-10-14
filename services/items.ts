import { Item } from '../types';
import { supabase } from '../lib/supabaseClient';
import { generateCode } from './localStore';

export const ItemService = {
  async getAll(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items from Supabase:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Item | undefined> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching item by id:', error);
      return undefined;
    }
    return data || undefined;
  },

  async getByCustomerId(customerId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error fetching items for customer:', error);
      return [];
    }
    return data || [];
  },

  async findOrCreate(itemData: Omit<Item, 'id' | 'item_code' | 'created_at'>): Promise<Item> {
    // Check if item with same drawing number and revision already exists
    const { data: existingList } = await supabase
      .from('items')
      .select('*')
      .ilike('drawing_number', itemData.drawing_number.trim())
      .ilike('drawing_revision', itemData.drawing_revision.trim())
      .limit(1);

    if (existingList && existingList.length > 0) {
      return existingList[0];
    }

    const allItems = await this.getAll();
    const newCode = generateCode('ITM', allItems);

    const { data, error } = await supabase
      .from('items')
      .insert({
        ...itemData,
        item_code: newCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async update(id: string, updates: Partial<Item>): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      throw new Error(error.message);
    }
  }
};
