import { Enquiry, EnquiryItem, TechnicalEvaluation } from '../types';
import { getStore, saveStore, generateCode, logActivity } from './localStore';

export const EnquiryService = {
  async getAll(): Promise<Enquiry[]> {
    const store = getStore();
    return store.enquiries;
  },

  async getById(id: string): Promise<Enquiry | undefined> {
    const store = getStore();
    return store.enquiries.find(e => e.id === id);
  },

  async getItemsByEnquiryId(enquiryId: string): Promise<EnquiryItem[]> {
    const store = getStore();
    return store.enquiryItems.filter(ei => ei.enquiry_id === enquiryId);
  },

  async create(
    enquiryData: Omit<Enquiry, 'id' | 'enquiry_code' | 'created_at' | 'updated_at'>,
    items: Omit<EnquiryItem, 'id' | 'enquiry_id'>[]
  ): Promise<Enquiry> {
    const store = getStore();
    const newId = `enq-${Date.now()}`;
    const newCode = generateCode('ENQ', store.enquiries);

    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: newId,
      enquiry_code: newCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.enquiries.unshift(newEnquiry);

    // Create enquiry items and matching technical evaluations
    items.forEach((item, idx) => {
      const enquiryItemId = `enq-item-${Date.now()}-${idx}`;
      const newEnquiryItem: EnquiryItem = {
        ...item,
        id: enquiryItemId,
        enquiry_id: newId,
      };
      store.enquiryItems.push(newEnquiryItem);

      // Auto-create Technical Evaluation
      const teId = `te-${Date.now()}-${idx}`;
      const te: TechnicalEvaluation = {
        id: teId,
        enquiry_id: newId,
        enquiry_item_id: enquiryItemId,
        evaluator_id: 'usr-4', // Default Technical User
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
        updated_at: new Date().toISOString(),
      };
      store.technicalEvaluations.push(te);
    });

    saveStore(store);

    logActivity(enquiryData.customer_id, 'enquiry', newId, newCode, `Enquiry ${newCode} was received.`);

    return newEnquiry;
  },

  async update(id: string, updates: Partial<Enquiry>): Promise<Enquiry> {
    const store = getStore();
    const index = store.enquiries.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Enquiry not found');

    const oldVal = store.enquiries[index];
    const updatedEnquiry = {
      ...oldVal,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    store.enquiries[index] = updatedEnquiry;
    saveStore(store);

    if (updates.status && updates.status !== oldVal.status) {
      logActivity(
        oldVal.customer_id,
        'enquiry',
        id,
        oldVal.enquiry_code,
        `Enquiry status changed from ${oldVal.status} to ${updates.status}.`,
        'status_change'
      );
    } else {
      logActivity(oldVal.customer_id, 'enquiry', id, oldVal.enquiry_code, `Enquiry updated.`, 'update');
    }

    return updatedEnquiry;
  },

  async delete(id: string): Promise<void> {
    const store = getStore();
    const index = store.enquiries.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Enquiry not found');
    
    const enq = store.enquiries[index];
    store.enquiries = store.enquiries.filter(e => e.id !== id);
    store.enquiryItems = store.enquiryItems.filter(ei => ei.enquiry_id !== id);
    store.technicalEvaluations = store.technicalEvaluations.filter(te => te.enquiry_id !== id);
    
    saveStore(store);
    logActivity(enq.customer_id, 'enquiry', id, enq.enquiry_code, `Enquiry ${enq.enquiry_code} deleted.`, 'delete');
  }
};
