import { Enquiry, EnquiryItem, TechnicalEvaluation } from '../types';
import { supabase } from '../lib/supabaseClient';
import { generateCode, logActivity } from './localStore';

export const EnquiryService = {
  async getAll(): Promise<Enquiry[]> {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching enquiries from Supabase:', error);
      return [];
    }
    return data || [];
  },

  async getAllItems(): Promise<EnquiryItem[]> {
    const { data, error } = await supabase
      .from('enquiry_items')
      .select('*');

    if (error) {
      console.error('Error fetching enquiry items:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Enquiry | undefined> {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching enquiry by id:', error);
      return undefined;
    }
    return data || undefined;
  },

  async getItemsByEnquiryId(enquiryId: string): Promise<EnquiryItem[]> {
    const { data, error } = await supabase
      .from('enquiry_items')
      .select('*')
      .eq('enquiry_id', enquiryId);

    if (error) {
      console.error('Error fetching items for enquiry:', error);
      return [];
    }
    return data || [];
  },

  async create(
    enquiryData: Omit<Enquiry, 'id' | 'enquiry_code' | 'created_at' | 'updated_at'>,
    items: Omit<EnquiryItem, 'id' | 'enquiry_id'>[]
  ): Promise<Enquiry> {
    const existing = await this.getAll();
    const newCode = generateCode('ENQ', existing);

    // 1. Insert parent enquiry
    const cleanEnquiryData = {
      ...enquiryData,
      sales_person_id: enquiryData.sales_person_id && enquiryData.sales_person_id.trim() !== '' ? enquiryData.sales_person_id : null,
      expected_order_date: enquiryData.expected_order_date && enquiryData.expected_order_date.trim() !== '' ? enquiryData.expected_order_date : null,
      enquiry_code: newCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newEnquiry, error: enqError } = await supabase
      .from('enquiries')
      .insert(cleanEnquiryData)
      .select()
      .single();

    if (enqError || !newEnquiry) {
      console.error('Error creating enquiry:', enqError);
      throw new Error(enqError?.message || 'Failed to create enquiry');
    }

    // 2. Insert enquiry items and corresponding technical evaluations
    for (const item of items) {
      const { data: insertedItem, error: itemErr } = await supabase
        .from('enquiry_items')
        .insert({
          ...item,
          enquiry_id: newEnquiry.id
        })
        .select()
        .single();

      if (!itemErr && insertedItem) {
        // Auto-create Technical Evaluation
        await supabase
          .from('technical_evaluations')
          .insert({
            enquiry_id: newEnquiry.id,
            enquiry_item_id: insertedItem.id,
            evaluator_id: enquiryData.sales_person_id || null,
            evaluation_date: new Date().toISOString(),
            material_feasibility: false,
            casting_feasibility: false,
            pattern_feasibility: false,
            machining_feasibility: false,
            quality_requirement_feasible: false,
            estimated_weight: 0,
            estimated_scrap_percent: 0,
            estimated_cycle_time_mins: 0,
            status: 'Pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    }

    await logActivity(
      enquiryData.customer_id,
      'enquiry',
      newEnquiry.id,
      newCode,
      `Enquiry ${newCode} was received.`
    );

    return newEnquiry;
  },

  async update(id: string, updates: Partial<Enquiry>): Promise<Enquiry> {
    const current = await this.getById(id);

    const { data, error } = await supabase
      .from('enquiries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating enquiry:', error);
      throw new Error(error?.message || 'Failed to update enquiry');
    }

    if (current) {
      if (updates.status && updates.status !== current.status) {
        await logActivity(
          current.customer_id,
          'enquiry',
          id,
          current.enquiry_code,
          `Enquiry status changed from ${current.status} to ${updates.status}.`,
          'status_change'
        );
      } else {
        await logActivity(
          current.customer_id,
          'enquiry',
          id,
          current.enquiry_code,
          `Enquiry updated.`,
          'update'
        );
      }
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const current = await this.getById(id);

    // Cascades delete items and technical_evaluations
    const { error } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting enquiry:', error);
      throw new Error(error.message);
    }

    if (current) {
      await logActivity(
        current.customer_id,
        'enquiry',
        id,
        current.enquiry_code,
        `Enquiry ${current.enquiry_code} deleted.`,
        'delete'
      );
    }
  }
};
