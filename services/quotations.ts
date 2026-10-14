import { Quotation, QuotationItem, QuotationStatus } from '../types';
import { supabase } from '../lib/supabaseClient';
import { generateCode, logActivity } from './localStore';

export const QuotationService = {
  async getAll(): Promise<Quotation[]> {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotations from Supabase:', error);
      return [];
    }
    return data || [];
  },

  async getAllItems(): Promise<QuotationItem[]> {
    const { data, error } = await supabase
      .from('quotation_items')
      .select('*');

    if (error) {
      console.error('Error fetching quotation items:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Quotation | undefined> {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching quotation by id:', error);
      return undefined;
    }
    return data || undefined;
  },

  async getItemsByQuotationId(quotationId: string): Promise<QuotationItem[]> {
    const { data, error } = await supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', quotationId);

    if (error) {
      console.error('Error fetching items for quotation:', error);
      return [];
    }
    return data || [];
  },

  async create(
    quotationData: Omit<Quotation, 'id' | 'quotation_code' | 'subtotal' | 'tax_amount' | 'discount_amount' | 'grand_total' | 'created_at' | 'updated_at'>,
    items: Omit<QuotationItem, 'id' | 'quotation_id' | 'amount' | 'discount_amount' | 'tax_amount'>[]
  ): Promise<Quotation> {
    const existing = await this.getAll();
    const newCode = generateCode('QUO', existing);

    // Fetch enquiry items to calculate quantities accurately
    const { data: enqItems } = await supabase
      .from('enquiry_items')
      .select('id, quantity');

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const preparedItems = items.map((item) => {
      const matched = enqItems?.find(ei => ei.id === item.enquiry_item_id);
      const qty = matched ? matched.quantity : 1;

      const itemAmount = item.rate * qty;
      const discountVal = itemAmount * (item.discount_percent / 100);
      const netAmount = itemAmount - discountVal;
      const taxVal = netAmount * (item.tax_percent / 100);
      const finalAmount = netAmount + taxVal;

      subtotal += itemAmount;
      totalDiscount += discountVal;
      totalTax += taxVal;

      return {
        ...item,
        discount_amount: discountVal,
        tax_amount: taxVal,
        amount: finalAmount
      };
    });

    const grand_total = subtotal - totalDiscount + totalTax;

    // Insert quotation
    const { data: newQuo, error: quoErr } = await supabase
      .from('quotations')
      .insert({
        ...quotationData,
        quotation_code: newCode,
        subtotal,
        discount_amount: totalDiscount,
        tax_amount: totalTax,
        grand_total,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (quoErr || !newQuo) {
      console.error('Error creating quotation:', quoErr);
      throw new Error(quoErr?.message || 'Failed to create quotation');
    }

    // Insert quotation line items
    for (const pItem of preparedItems) {
      await supabase
        .from('quotation_items')
        .insert({
          ...pItem,
          quotation_id: newQuo.id
        });
    }

    await logActivity(
      quotationData.customer_id,
      'quotation',
      newQuo.id,
      newCode,
      `Quotation ${newCode} generated for total ₹${grand_total.toLocaleString('en-IN')}.`
    );

    return newQuo;
  },

  async update(
    id: string,
    updates: Partial<Quotation>,
    newItems?: Omit<QuotationItem, 'id' | 'quotation_id' | 'amount' | 'discount_amount' | 'tax_amount'>[]
  ): Promise<Quotation> {
    const current = await this.getById(id);

    const { data, error } = await supabase
      .from('quotations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating quotation:', error);
      throw new Error(error?.message || 'Failed to update quotation');
    }

    if (newItems && newItems.length > 0) {
      // Replace quotation line items
      await supabase.from('quotation_items').delete().eq('quotation_id', id);
      for (const item of newItems) {
        const itemAmount = item.rate * 1;
        const discountVal = itemAmount * (item.discount_percent / 100);
        const netAmount = itemAmount - discountVal;
        const taxVal = netAmount * (item.tax_percent / 100);
        await supabase
          .from('quotation_items')
          .insert({
            ...item,
            quotation_id: id,
            discount_amount: discountVal,
            tax_amount: taxVal,
            amount: netAmount + taxVal
          });
      }
    }

    if (current && updates.status && updates.status !== current.status) {
      await logActivity(
        current.customer_id,
        'quotation',
        id,
        current.quotation_code,
        `Quotation status moved to ${updates.status}.`,
        'status_change'
      );
    }

    return data;
  },

  async approve(id: string, approvedBy: string, remarks?: string): Promise<Quotation> {
    const current = await this.getById(id);
    if (!current) throw new Error('Quotation not found');

    const { data, error } = await supabase
      .from('quotations')
      .update({
        status: 'Approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        approval_remarks: remarks || 'Approved by Manager',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to approve quotation');
    }

    await logActivity(
      current.customer_id,
      'quotation',
      id,
      current.quotation_code,
      `Quotation ${current.quotation_code} was officially approved.`,
      'status_change'
    );

    return data;
  },

  async delete(id: string): Promise<void> {
    const current = await this.getById(id);
    const { error } = await supabase.from('quotations').delete().eq('id', id);
    if (error) throw new Error(error.message);

    if (current) {
      await logActivity(
        current.customer_id,
        'quotation',
        id,
        current.quotation_code,
        `Quotation ${current.quotation_code} deleted.`,
        'delete'
      );
    }
  }
};
