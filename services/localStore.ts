import { Profile, Activity } from '../types';
import { supabase } from '../lib/supabaseClient';

const IS_SERVER = typeof window === 'undefined';

export const getStoredUser = (): Profile | null => {
  if (IS_SERVER) return null;
  const user = localStorage.getItem('truform_crm_user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user: Profile) => {
  if (IS_SERVER) return;
  localStorage.setItem('truform_crm_user', JSON.stringify(user));
};

export const clearStoredUser = () => {
  if (IS_SERVER) return;
  localStorage.removeItem('truform_crm_user');
  localStorage.removeItem('crm_authenticated');
};

// Generates next readable sequential code like CUS-00006, ENQ-00003, ITM-00006
export const generateCode = (prefix: string, list: { customer_code?: string; enquiry_code?: string; quotation_code?: string; order_code?: string; complaint_code?: string; follow_up_code?: string; dispatch_code?: string; item_code?: string }[]): string => {
  let maxNum = 0;
  if (list && Array.isArray(list)) {
    list.forEach(item => {
      const code = item.customer_code || item.enquiry_code || item.quotation_code || item.order_code || item.complaint_code || item.follow_up_code || item.dispatch_code || item.item_code || '';
      const parts = code.split('-');
      if (parts.length > 1) {
        const val = parseInt(parts[1], 10);
        if (!isNaN(val) && val > maxNum) maxNum = val;
      }
    });
  }
  return `${prefix}-${String(maxNum + 1).padStart(5, '0')}`;
};

export const logActivity = async (
  customerId: string,
  entityType: Activity['entity_type'],
  entityId: string,
  entityCode: string,
  description: string,
  actionType: Activity['action_type'] = 'create'
) => {
  try {
    const user = getStoredUser();
    await supabase
      .from('activities')
      .insert({
        customer_id: customerId,
        user_id: user?.id || null,
        user_name: user?.name || 'System Operator',
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        entity_code: entityCode,
        description,
        created_at: new Date().toISOString()
      });
  } catch (err) {
    console.error('Failed to log activity to Supabase:', err);
  }
};
