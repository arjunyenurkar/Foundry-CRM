import { 
  Customer, Enquiry, Item, EnquiryItem, TechnicalEvaluation, 
  Quotation, QuotationItem, FollowUp, Order, OrderItem, 
  Dispatch, DispatchItem, Complaint, Profile, Activity, Notification 
} from '../types';
import * as initialData from '../lib/mockData';

const IS_SERVER = typeof window === 'undefined';

interface DBState {
  users: Profile[];
  customers: Customer[];
  items: Item[];
  enquiries: Enquiry[];
  enquiryItems: EnquiryItem[];
  technicalEvaluations: TechnicalEvaluation[];
  quotations: Quotation[];
  quotationItems: QuotationItem[];
  followUps: FollowUp[];
  orders: Order[];
  orderItems: OrderItem[];
  dispatches: Dispatch[];
  dispatchItems: DispatchItem[];
  complaints: Complaint[];
  activities: Activity[];
  notifications: Notification[];
  currentUser: Profile;
}

const getInitialState = (): DBState => {
  return {
    users: [...initialData.mockUsers],
    customers: [...initialData.mockCustomers],
    items: [...initialData.mockItems],
    enquiries: [...initialData.mockEnquiries],
    enquiryItems: [...initialData.mockEnquiryItems],
    technicalEvaluations: [...initialData.mockTechnicalEvaluations],
    quotations: [...initialData.mockQuotations],
    quotationItems: [...initialData.mockQuotationItems],
    followUps: [...initialData.mockFollowUps],
    orders: [...initialData.mockOrders],
    orderItems: [...initialData.mockOrderItems],
    dispatches: [...initialData.mockDispatches],
    dispatchItems: [...initialData.mockDispatchItems],
    complaints: [...initialData.mockComplaints],
    activities: [...initialData.mockActivities],
    notifications: [...initialData.mockNotifications],
    currentUser: initialData.mockUsers[0], // Default is Sohail Khan (Marketing Manager)
  };
};

export const getStore = (): DBState => {
  if (IS_SERVER) {
    return getInitialState();
  }
  const data = localStorage.getItem('truform_crm_db_v2');
  if (!data) {
    const state = getInitialState();
    localStorage.setItem('truform_crm_db_v2', JSON.stringify(state));
    return state;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    const state = getInitialState();
    localStorage.setItem('truform_crm_db_v2', JSON.stringify(state));
    return state;
  }
};

export const saveStore = (state: DBState) => {
  if (IS_SERVER) return;
  localStorage.setItem('truform_crm_db_v2', JSON.stringify(state));
};

export const resetStore = () => {
  if (IS_SERVER) return;
  const state = getInitialState();
  localStorage.setItem('truform_crm_db_v2', JSON.stringify(state));
};

// Generates next readable code like CUS-00021, ENQ-00031, ITM-00006
export const generateCode = (prefix: string, list: { customer_code?: string; enquiry_code?: string; quotation_code?: string; order_code?: string; complaint_code?: string; follow_up_code?: string; dispatch_code?: string; item_code?: string }[]): string => {
  let maxNum = 0;
  list.forEach(item => {
    const code = item.customer_code || item.enquiry_code || item.quotation_code || item.order_code || item.complaint_code || item.follow_up_code || item.dispatch_code || item.item_code || '';
    const numPart = code.split('-')[1];
    if (numPart) {
      const val = parseInt(numPart, 10);
      if (val > maxNum) maxNum = val;
    }
  });
  return `${prefix}-${String(maxNum + 1).padStart(5, '0')}`;
};

export const logActivity = (
  customerId: string,
  entityType: Activity['entity_type'],
  entityId: string,
  entityCode: string,
  description: string,
  actionType: Activity['action_type'] = 'create'
) => {
  const store = getStore();
  const newActivity: Activity = {
    id: `act-${Date.now()}`,
    customer_id: customerId,
    user_id: store.currentUser.id,
    user_name: store.currentUser.name,
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId,
    entity_code: entityCode,
    description,
    created_at: new Date().toISOString(),
  };
  store.activities.unshift(newActivity);
  saveStore(store);
};
