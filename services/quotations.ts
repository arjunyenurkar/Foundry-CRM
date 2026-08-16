import { Quotation, QuotationItem, QuotationStatus } from '../types';
import { getStore, saveStore, generateCode, logActivity } from './localStore';

export const QuotationService = {
  async getAll(): Promise<Quotation[]> {
    const store = getStore();
    return store.quotations;
  },

  async getById(id: string): Promise<Quotation | undefined> {
    const store = getStore();
    return store.quotations.find(q => q.id === id);
  },

  async getItemsByQuotationId(quotationId: string): Promise<QuotationItem[]> {
    const store = getStore();
    return store.quotationItems.filter(qi => qi.quotation_id === quotationId);
  },

  async create(
    quotationData: Omit<Quotation, 'id' | 'quotation_code' | 'subtotal' | 'tax_amount' | 'discount_amount' | 'grand_total' | 'created_at' | 'updated_at'>,
    items: Omit<QuotationItem, 'id' | 'quotation_id' | 'amount' | 'discount_amount' | 'tax_amount'>[]
  ): Promise<Quotation> {
    const store = getStore();
    const newId = `q-${Date.now()}`;
    const newCode = generateCode('QUO', store.quotations);

    // Calculate totals programmatically
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const newItems: QuotationItem[] = items.map((item, idx) => {
      const qItemId = `q-item-${Date.now()}-${idx}`;
      const enqItem = store.enquiryItems.find(ei => ei.id === item.enquiry_item_id);
      const qty = enqItem ? enqItem.quantity : 1;
      
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
        id: qItemId,
        quotation_id: newId,
        discount_amount: discountVal,
        tax_amount: taxVal,
        amount: finalAmount
      };
    });

    const grand_total = subtotal - totalDiscount + totalTax;

    const newQuotation: Quotation = {
      ...quotationData,
      id: newId,
      quotation_code: newCode,
      subtotal,
      discount_amount: totalDiscount,
      tax_amount: totalTax,
      grand_total,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.quotations.unshift(newQuotation);
    store.quotationItems.push(...newItems);

    // If quotation is created, change enquiry status to "Quotation Sent" if quotation status is Sent,
    // or keep as "Quotation Pending" if Draft.
    if (quotationData.status === 'Sent' || quotationData.status === 'Under Approval') {
      const enq = store.enquiries.find(e => e.id === quotationData.enquiry_id);
      if (enq) {
        enq.status = quotationData.status === 'Sent' ? 'Quotation Sent' : 'Under Review';
        enq.updated_at = new Date().toISOString();
      }
    }

    saveStore(store);
    logActivity(quotationData.customer_id, 'quotation', newId, newCode, `Quotation ${newCode} was drafted.`);

    return newQuotation;
  },

  async update(id: string, updates: Partial<Quotation>, items?: Omit<QuotationItem, 'id' | 'quotation_id' | 'amount' | 'discount_amount' | 'tax_amount'>[]): Promise<Quotation> {
    const store = getStore();
    const index = store.quotations.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Quotation not found');

    const oldVal = store.quotations[index];

    let computedUpdates = { ...updates };

    if (items) {
      // Re-calculate all items if provided
      store.quotationItems = store.quotationItems.filter(qi => qi.quotation_id !== id);
      
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      const newItems: QuotationItem[] = items.map((item, idx) => {
        const qItemId = `q-item-${Date.now()}-${idx}`;
        const enqItem = store.enquiryItems.find(ei => ei.id === item.enquiry_item_id);
        const qty = enqItem ? enqItem.quantity : 1;
        
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
          id: qItemId,
          quotation_id: id,
          discount_amount: discountVal,
          tax_amount: taxVal,
          amount: finalAmount
        };
      });

      const grand_total = subtotal - totalDiscount + totalTax;

      computedUpdates = {
        ...computedUpdates,
        subtotal,
        discount_amount: totalDiscount,
        tax_amount: totalTax,
        grand_total
      };

      store.quotationItems.push(...newItems);
    }

    const updatedQuotation = {
      ...oldVal,
      ...computedUpdates,
      updated_at: new Date().toISOString()
    };

    store.quotations[index] = updatedQuotation;

    // Handle workflow changes
    if (updates.status && updates.status !== oldVal.status) {
      logActivity(
        oldVal.customer_id,
        'quotation',
        id,
        oldVal.quotation_code,
        `Quotation status updated from ${oldVal.status} to ${updates.status}.`,
        'status_change'
      );

      // Auto-update linked enquiry status
      const enq = store.enquiries.find(e => e.id === oldVal.enquiry_id);
      if (enq) {
        if (updates.status === 'Accepted') {
          enq.status = 'Won';
        } else if (updates.status === 'Rejected') {
          enq.status = 'Lost';
        } else if (updates.status === 'Sent') {
          enq.status = 'Quotation Sent';
        } else if (updates.status === 'Negotiation') {
          enq.status = 'Negotiation';
        }
        enq.updated_at = new Date().toISOString();
      }
    } else {
      logActivity(oldVal.customer_id, 'quotation', id, oldVal.quotation_code, `Quotation details updated.`, 'update');
    }

    saveStore(store);
    return updatedQuotation;
  },

  async approve(id: string, approverId: string, remarks?: string): Promise<Quotation> {
    return this.update(id, {
      status: 'Approved',
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      approval_remarks: remarks
    });
  },

  async delete(id: string): Promise<void> {
    const store = getStore();
    const index = store.quotations.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Quotation not found');

    const quo = store.quotations[index];
    store.quotations = store.quotations.filter(q => q.id !== id);
    store.quotationItems = store.quotationItems.filter(qi => qi.quotation_id !== id);

    saveStore(store);
    logActivity(quo.customer_id, 'quotation', id, quo.quotation_code, `Quotation ${quo.quotation_code} deleted.`, 'delete');
  }
};
