'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Customer, Enquiry, Item, EnquiryItem, TechnicalEvaluation, 
  Quotation, QuotationItem, FollowUp, Order, OrderItem, 
  Dispatch, DispatchItem, Complaint, Profile, Activity, Notification, UserRole
} from '../types';
import { getStore, saveStore, resetStore } from '../services/localStore';
import { CustomerService } from '../services/customers';
import { ItemService } from '../services/items';
import { EnquiryService } from '../services/enquiries';
import { TechnicalService } from '../services/technical';
import { QuotationService } from '../services/quotations';
import { FollowUpService } from '../services/followups';
import { OrderService } from '../services/orders';
import { DispatchService } from '../services/dispatches';
import { ComplaintService } from '../services/complaints';
import { NotificationService } from '../services/notifications';
import { ActivityService } from '../services/activities';

interface CRMContextType {
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
  
  // Actions
  refreshData: () => void;
  resetDemoData: () => void;
  changeUser: (userId: string) => void;
  
  // Entity mutations
  createCustomer: (data: Omit<Customer, 'id' | 'customer_code' | 'created_at'>) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  
  createItem: (data: Omit<Item, 'id' | 'item_code' | 'created_at'>) => Promise<Item>;
  
  createEnquiry: (enq: Omit<Enquiry, 'id' | 'enquiry_code' | 'created_at' | 'updated_at'>, items: Omit<EnquiryItem, 'id' | 'enquiry_id'>[]) => Promise<Enquiry>;
  updateEnquiry: (id: string, data: Partial<Enquiry>) => Promise<Enquiry>;
  
  updateTechnicalEvaluation: (id: string, data: Partial<TechnicalEvaluation>) => Promise<TechnicalEvaluation>;
  
  createQuotation: (quo: Omit<Quotation, 'id' | 'quotation_code' | 'subtotal' | 'tax_amount' | 'discount_amount' | 'grand_total' | 'created_at' | 'updated_at'>, items: Omit<QuotationItem, 'id' | 'quotation_id' | 'amount' | 'discount_amount' | 'tax_amount'>[]) => Promise<Quotation>;
  updateQuotation: (id: string, data: Partial<Quotation>, items?: Omit<QuotationItem, 'id' | 'quotation_id' | 'amount' | 'discount_amount' | 'tax_amount'>[]) => Promise<Quotation>;
  approveQuotation: (id: string, remarks?: string) => Promise<Quotation>;
  
  createFollowUp: (data: Omit<FollowUp, 'id' | 'follow_up_code' | 'created_at'>) => Promise<FollowUp>;
  updateFollowUp: (id: string, data: Partial<FollowUp>) => Promise<FollowUp>;
  
  createOrder: (data: Omit<Order, 'id' | 'order_code' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id' | 'dispatched_quantity'>[]) => Promise<Order>;
  convertQuotationToOrder: (quotationId: string, poNumber: string, poDate: string, expectedDeliveryDate: string, remarks?: string) => Promise<Order>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<Order>;
  
  createDispatch: (data: Omit<Dispatch, 'id' | 'dispatch_code' | 'created_at'>, items: { order_item_id: string; quantity: number }[]) => Promise<Dispatch>;
  
  createComplaint: (data: Omit<Complaint, 'id' | 'complaint_code' | 'created_at' | 'updated_at'>) => Promise<Complaint>;
  updateComplaint: (id: string, data: Partial<Complaint>) => Promise<Complaint>;
  
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  
  // Permissions checker helper
  hasPermission: (action: 'create' | 'read' | 'update' | 'delete' | 'approve', module: string) => boolean;
  
  // Sidebar collapsed state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Auth state
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

  const refreshData = () => {
    setState(getStore());
  };

  useEffect(() => {
    refreshData();
    if (typeof window !== 'undefined') {
      const authed = localStorage.getItem('crm_authenticated');
      if (authed === 'true') {
        const store = getStore();
        const userExists = store.users.some(u => u.id === store.currentUser?.id && ['Mohd Sohail Khan', 'Alka Deshpande', 'Kiran Meshram'].includes(u.name));
        if (userExists) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('crm_authenticated');
          setIsAuthenticated(false);
          if (store.users.length > 0) {
            store.currentUser = store.users[0];
            saveStore(store);
          }
        }
      } else {
        // If not authenticated, ensure the default profile is Mohd Sohail Khan
        const store = getStore();
        if (store.users.length > 0 && store.currentUser?.name !== store.users[0].name) {
          store.currentUser = store.users[0];
          saveStore(store);
        }
      }
      const saved = localStorage.getItem('sidebar-collapsed');
      setSidebarCollapsedState(saved === 'true');
    }
  }, []);

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(collapsed));
    }
  };

  if (!state) {
    // Show a blank loading or fallback during SSR hydration match
    return <div className="min-h-screen bg-[#f4f6fa] dark:bg-[#090b11] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100"></div>
    </div>;
  }

  const resetDemoData = () => {
    resetStore();
    refreshData();
  };

  const changeUser = (userId: string) => {
    const store = getStore();
    const user = store.users.find(u => u.id === userId);
    if (user) {
      store.currentUser = user;
      saveStore(store);
      refreshData();
    }
  };

  // Helper to check user permission
  const hasPermission = (action: 'create' | 'read' | 'update' | 'delete' | 'approve', module: string): boolean => {
    const role = state.currentUser.role;
    if (role === 'Admin' || role === 'Back Office Executive') return true;
    
    if (role === 'Management') {
      return action === 'read'; // Read-only dashboard & reports
    }

    if (role === 'Technical User') {
      if (module === 'technical') {
        return ['read', 'update'].includes(action);
      }
      return action === 'read';
    }

    if (role === 'Sales Manager' || role === 'Marketing Manager') {
      if (module === 'quotations' && action === 'approve') return true;
      return action !== 'delete'; // Can create, read, update everything except delete
    }

    if (role === 'Sales Executive' || role === 'Marketing Coordinator') {
      if (module === 'quotations' && action === 'approve') return false;
      return action === 'create' || action === 'read' || action === 'update'; // Cannot delete, cannot approve quotations
    }

    return false;
  };

  return (
    <CRMContext.Provider value={{
      ...state,
      refreshData,
      resetDemoData,
      changeUser,
      hasPermission,
      
      // CRM actions wrapped to call service layer + trigger UI update
      createCustomer: async (data) => {
        const res = await CustomerService.create(data);
        refreshData();
        return res;
      },
      updateCustomer: async (id, data) => {
        const res = await CustomerService.update(id, data);
        refreshData();
        return res;
      },
      deleteCustomer: async (id) => {
        await CustomerService.delete(id);
        refreshData();
      },
      
      createItem: async (data) => {
        const res = await ItemService.findOrCreate(data);
        refreshData();
        return res;
      },
      
      createEnquiry: async (enq, items) => {
        const res = await EnquiryService.create(enq, items);
        refreshData();
        return res;
      },
      updateEnquiry: async (id, data) => {
        const res = await EnquiryService.update(id, data);
        refreshData();
        return res;
      },
      
      updateTechnicalEvaluation: async (id, data) => {
        const res = await TechnicalService.update(id, data);
        refreshData();
        return res;
      },
      
      createQuotation: async (quo, items) => {
        const res = await QuotationService.create(quo, items);
        refreshData();
        return res;
      },
      updateQuotation: async (id, data, items) => {
        const res = await QuotationService.update(id, data, items);
        refreshData();
        return res;
      },
      approveQuotation: async (id, remarks) => {
        const res = await QuotationService.approve(id, state.currentUser.id, remarks);
        refreshData();
        return res;
      },
      
      createFollowUp: async (data) => {
        const res = await FollowUpService.create(data);
        refreshData();
        return res;
      },
      updateFollowUp: async (id, data) => {
        const res = await FollowUpService.update(id, data);
        refreshData();
        return res;
      },
      
      createOrder: async (data, items) => {
        const res = await OrderService.create(data, items);
        refreshData();
        return res;
      },
      convertQuotationToOrder: async (quotationId, poNumber, poDate, expectedDeliveryDate, remarks) => {
        const res = await OrderService.convertFromQuotation(quotationId, poNumber, poDate, expectedDeliveryDate, remarks);
        refreshData();
        return res;
      },
      updateOrder: async (id, data) => {
        const res = await OrderService.update(id, data);
        refreshData();
        return res;
      },
      
      createDispatch: async (data, items) => {
        const res = await DispatchService.create(data, items);
        refreshData();
        return res;
      },
      
      createComplaint: async (data) => {
        const res = await ComplaintService.create(data);
        refreshData();
        return res;
      },
      updateComplaint: async (id, data) => {
        const res = await ComplaintService.update(id, data);
        refreshData();
        return res;
      },
      
      markNotificationRead: async (id) => {
        await NotificationService.markAsRead(id);
        refreshData();
      },
      markAllNotificationsRead: async () => {
        await NotificationService.markAllAsRead();
        refreshData();
      },
      
      isAuthenticated,
      sidebarCollapsed,
      setSidebarCollapsed,
      login: async (email, password) => {
        const store = getStore();
        const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && password === 'password123') {
          store.currentUser = user;
          saveStore(store);
          if (typeof window !== 'undefined') {
            localStorage.setItem('crm_authenticated', 'true');
          }
          setIsAuthenticated(true);
          refreshData();
          return true;
        }
        return false;
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('crm_authenticated');
        }
        setIsAuthenticated(false);
      }
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
