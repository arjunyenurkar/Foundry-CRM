import { TechnicalEvaluation, TechnicalEvaluationStatus } from '../types';
import { getStore, saveStore, logActivity } from './localStore';

export const TechnicalService = {
  async getAll(): Promise<TechnicalEvaluation[]> {
    const store = getStore();
    return store.technicalEvaluations;
  },

  async getById(id: string): Promise<TechnicalEvaluation | undefined> {
    const store = getStore();
    return store.technicalEvaluations.find(te => te.id === id);
  },

  async getByEnquiryId(enquiryId: string): Promise<TechnicalEvaluation[]> {
    const store = getStore();
    return store.technicalEvaluations.filter(te => te.enquiry_id === enquiryId);
  },

  async update(id: string, updates: Partial<TechnicalEvaluation>): Promise<TechnicalEvaluation> {
    const store = getStore();
    const index = store.technicalEvaluations.findIndex(te => te.id === id);
    if (index === -1) throw new Error('Technical evaluation not found');

    const oldVal = store.technicalEvaluations[index];
    const updatedTe = {
      ...oldVal,
      ...updates,
      updated_at: new Date().toISOString()
    };

    store.technicalEvaluations[index] = updatedTe;

    // If status is updated to Approved, check if all items in the enquiry are evaluated.
    // If so, we can auto-update the Enquiry status to "Quotation Pending"!
    // This connects the workflow automatically.
    if (updates.status && updates.status !== oldVal.status) {
      const enq = store.enquiries.find(e => e.id === oldVal.enquiry_id);
      if (enq) {
        // Find other evaluations for this enquiry
        const siblingEvaluations = store.technicalEvaluations.filter(te => te.enquiry_id === oldVal.enquiry_id && te.id !== id);
        const allEvaluated = [updatedTe, ...siblingEvaluations].every(te => te.status === 'Approved');
        
        if (allEvaluated && enq.status === 'Technical Evaluation') {
          enq.status = 'Quotation Pending';
          enq.updated_at = new Date().toISOString();
          
          logActivity(
            enq.customer_id,
            'enquiry',
            enq.id,
            enq.enquiry_code,
            `Enquiry status auto-changed to 'Quotation Pending' as all items approved in Technical Evaluation.`,
            'status_change'
          );
        }

        logActivity(
          enq.customer_id,
          'technical',
          id,
          enq.enquiry_code,
          `Technical evaluation for item updated to status: ${updates.status}.`,
          'status_change'
        );
      }
    }

    saveStore(store);
    return updatedTe;
  }
};
