import { TechnicalEvaluation } from '../types';
import { supabase } from '../lib/supabaseClient';
import { logActivity } from './localStore';

export const TechnicalService = {
  async getAll(): Promise<TechnicalEvaluation[]> {
    const { data, error } = await supabase
      .from('technical_evaluations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching technical evaluations from Supabase:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<TechnicalEvaluation | undefined> {
    const { data, error } = await supabase
      .from('technical_evaluations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching technical evaluation by id:', error);
      return undefined;
    }
    return data || undefined;
  },

  async getByEnquiryId(enquiryId: string): Promise<TechnicalEvaluation[]> {
    const { data, error } = await supabase
      .from('technical_evaluations')
      .select('*')
      .eq('enquiry_id', enquiryId);

    if (error) {
      console.error('Error fetching technical evaluations by enquiryId:', error);
      return [];
    }
    return data || [];
  },

  async update(id: string, updates: Partial<TechnicalEvaluation>): Promise<TechnicalEvaluation> {
    const current = await this.getById(id);

    const { data, error } = await supabase
      .from('technical_evaluations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating technical evaluation:', error);
      throw new Error(error?.message || 'Failed to update technical evaluation');
    }

    if (current && updates.status && updates.status !== current.status) {
      // Find enquiry
      const { data: enq } = await supabase
        .from('enquiries')
        .select('*')
        .eq('id', current.enquiry_id)
        .single();

      if (enq) {
        // Find other evaluations for this enquiry
        const { data: siblingEvaluations } = await supabase
          .from('technical_evaluations')
          .select('status')
          .eq('enquiry_id', current.enquiry_id);

        const allApproved = siblingEvaluations && siblingEvaluations.length > 0 && siblingEvaluations.every(te => te.status === 'Approved');

        if (allApproved && enq.status === 'Technical Evaluation') {
          await supabase
            .from('enquiries')
            .update({
              status: 'Quotation Pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', enq.id);

          await logActivity(
            enq.customer_id,
            'enquiry',
            enq.id,
            enq.enquiry_code,
            `Enquiry status auto-changed to 'Quotation Pending' as all items approved in Technical Evaluation.`,
            'status_change'
          );
        }

        await logActivity(
          enq.customer_id,
          'technical',
          id,
          enq.enquiry_code,
          `Technical evaluation for item updated to status: ${updates.status}.`,
          'status_change'
        );
      }
    }

    return data;
  }
};
