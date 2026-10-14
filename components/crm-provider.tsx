'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Customer, Enquiry, Item, EnquiryItem, TechnicalEvaluation, 
  Quotation, QuotationItem, FollowUp, Order, OrderItem, 
  Dispatch, DispatchItem, Complaint, Profile, Activity, Notification 
} from '../types';
import { supabase } from '../lib/supabaseClient';
import { getStoredUser, setStoredUser, clearStoredUser } from '../services/localStore';
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
  refreshData: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  changeUser: (userId: string) => void;
  
  // Entity mutations
  createCustomer: (data: Omit<Customer, 'id' | 'customer_code' | 'created_at'>) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  
  createItem: (data: Omit<Item, 'id' | 'item_code' | 'created_at'>) => Promise<Item>;
  
  createEnquiry: (enq: Omit<Enquiry, 'id' | 'enquiry_code' | 'created_at' | 'updated_at'>, items: Omit<EnquiryItem, 'id' | 'enquiry_id'>[]) => Promise<Enquiry>;
  updateEnquiry: (id: string, data: Partial<Enquiry>) => Promise<Enquiry>;
  deleteEnquiry: (id: string) => Promise<void>;
  
  updateTechnicalEvaluation: (id: string, data: Partial<TechnicalEvaluation>) => Promise<TechnicalEvaluation>;
  
  createQuotation: (quo: Omit<Quotation, 'id' | 'quotation_code' | 'subtotal' | 'tax_amount' | 'discount_amount' | 'grand_total' | 'created_at' | 'updated_at'>, items: Omit<QuotationItem, 'id' | 'quotation_id' | 'amount' | 'discount_amount' | 'tax_amount'>[]) => Promise<Quotation>;
  updateQuotation: (id: string, data: Partial<Quotation>, items?: Omit<QuotationItem, 'id' | 'quotation_id' | 'amount' | 'discount_amount' | 'tax_amount'>[]) => Promise<Quotation>;
  approveQuotation: (id: string, remarks?: string) => Promise<Quotation>;
  deleteQuotation: (id: string) => Promise<void>;
  
  createFollowUp: (data: Omit<FollowUp, 'id' | 'follow_up_code' | 'created_at'>) => Promise<FollowUp>;
  updateFollowUp: (id: string, data: Partial<FollowUp>) => Promise<FollowUp>;
  deleteFollowUp: (id: string) => Promise<void>;
  
  createOrder: (data: Omit<Order, 'id' | 'order_code' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id' | 'dispatched_quantity'>[]) => Promise<Order>;
  convertQuotationToOrder: (quotationId: string, poNumber: string, poDate: string, expectedDeliveryDate: string, remarks?: string) => Promise<Order>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  
  createDispatch: (data: Omit<Dispatch, 'id' | 'dispatch_code' | 'created_at'>, items: { order_item_id: string; quantity: number }[]) => Promise<Dispatch>;
  deleteDispatch: (id: string) => Promise<void>;
  
  createComplaint: (data: Omit<Complaint, 'id' | 'complaint_code' | 'created_at' | 'updated_at'>) => Promise<Complaint>;
  updateComplaint: (id: string, data: Partial<Complaint>) => Promise<Complaint>;
  deleteComplaint: (id: string) => Promise<void>;
  
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
  const [users, setUsers] = useState<Profile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiryItems, setEnquiryItems] = useState<EnquiryItem[]>([]);
  const [technicalEvaluations, setTechnicalEvaluations] = useState<TechnicalEvaluation[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [dispatchItems, setDispatchItems] = useState<DispatchItem[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [currentUser, setCurrentUser] = useState<Profile>({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Arjun Yenurkar',
    email: 'arjunyenurkar009@gmail.com',
    role: 'Admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      const [
        profsRes,
        custRes,
        itemsRes,
        enqRes,
        enqItemsRes,
        techRes,
        quoRes,
        quoItemsRes,
        folRes,
        ordRes,
        ordItemsRes,
        dspRes,
        dspItemsRes,
        compRes,
        actRes,
        notifRes
      ] = await Promise.all([
        supabase.from('profiles').select('id, email, name, role, avatar_url'),
        CustomerService.getAll(),
        ItemService.getAll(),
        EnquiryService.getAll(),
        EnquiryService.getAllItems(),
        TechnicalService.getAll(),
        QuotationService.getAll(),
        QuotationService.getAllItems(),
        FollowUpService.getAll(),
        OrderService.getAll(),
        OrderService.getAllItems(),
        DispatchService.getAll(),
        DispatchService.getAllItems(),
        ComplaintService.getAll(),
        ActivityService.getAll(),
        NotificationService.getAll()
      ]);

      if (profsRes.data && profsRes.data.length > 0) {
        setUsers(profsRes.data as Profile[]);
      }
      setCustomers(custRes);
      setItems(itemsRes);
      setEnquiries(enqRes);
      setEnquiryItems(enqItemsRes);
      setTechnicalEvaluations(techRes);
      setQuotations(quoRes);
      setQuotationItems(quoItemsRes);
      setFollowUps(folRes);
      setOrders(ordRes);
      setOrderItems(ordItemsRes);
      setDispatches(dspRes);
      setDispatchItems(dspItemsRes);
      setComplaints(compRes);
      setActivities(actRes);
      setNotifications(notifRes);

      const stored = getStoredUser();
      if (stored) {
        setCurrentUser(stored);
      } else if (profsRes.data && profsRes.data.length > 0) {
        setCurrentUser(profsRes.data[0] as Profile);
      }
    } catch (err) {
      console.error('Error refreshing CRM data from Supabase:', err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshData();
    if (typeof window !== 'undefined') {
      const authed = localStorage.getItem('crm_authenticated');
      const stored = getStoredUser();
      if (authed === 'true' && stored) {
        setIsAuthenticated(true);
        setCurrentUser(stored);
      } else {
        setIsAuthenticated(false);
      }
      const saved = localStorage.getItem('sidebar-collapsed');
      setSidebarCollapsedState(saved === 'true');
    }
  }, [refreshData]);

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(collapsed));
    }
  };

  const resetDemoData = async () => {
    await refreshData();
  };

  const changeUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setStoredUser(user);
    }
  };

  const hasPermission = (action: 'create' | 'read' | 'update' | 'delete' | 'approve', module: string): boolean => {
    const role = currentUser.role;
    if (role === 'Admin' || role === 'Back Office Executive') return true;
    
    if (role === 'Management') {
      return action === 'read';
    }

    if (role === 'Technical User') {
      if (module === 'technical') {
        return ['read', 'update'].includes(action);
      }
      return action === 'read';
    }

    if (role === 'Sales Manager' || role === 'Marketing Manager') {
      if (module === 'quotations' && action === 'approve') return true;
      return true;
    }

    if (role === 'Sales Executive' || role === 'Marketing Coordinator') {
      if (module === 'quotations' && action === 'approve') return false;
      return action === 'create' || action === 'read' || action === 'update';
    }

    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setStoredUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('crm_authenticated', 'true');
        }
        setIsAuthenticated(true);
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    clearStoredUser();
    setIsAuthenticated(false);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#f4f6fa] dark:bg-[#090b11] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100"></div>
        <p className="text-xs font-semibold text-slate-500">Connecting to Supabase Database...</p>
      </div>
    );
  }

  return (
    <CRMContext.Provider value={{
      users,
      customers,
      items,
      enquiries,
      enquiryItems,
      technicalEvaluations,
      quotations,
      quotationItems,
      followUps,
      orders,
      orderItems,
      dispatches,
      dispatchItems,
      complaints,
      activities,
      notifications,
      currentUser,
      
      refreshData,
      resetDemoData,
      changeUser,
      hasPermission,
      
      createCustomer: async (data) => {
        const res = await CustomerService.create(data);
        await refreshData();
        return res;
      },
      updateCustomer: async (id, data) => {
        const res = await CustomerService.update(id, data);
        await refreshData();
        return res;
      },
      deleteCustomer: async (id) => {
        await CustomerService.delete(id);
        await refreshData();
      },
      
      createItem: async (data) => {
        const res = await ItemService.findOrCreate(data);
        await refreshData();
        return res;
      },
      
      createEnquiry: async (enq, itemsList) => {
        const res = await EnquiryService.create(enq, itemsList);
        await refreshData();
        return res;
      },
      updateEnquiry: async (id, data) => {
        const res = await EnquiryService.update(id, data);
        await refreshData();
        return res;
      },
      deleteEnquiry: async (id) => {
        await EnquiryService.delete(id);
        await refreshData();
      },
      
      updateTechnicalEvaluation: async (id, data) => {
        const res = await TechnicalService.update(id, data);
        await refreshData();
        return res;
      },
      
      createQuotation: async (quo, itemsList) => {
        const res = await QuotationService.create(quo, itemsList);
        await refreshData();
        return res;
      },
      updateQuotation: async (id, data, itemsList) => {
        const res = await QuotationService.update(id, data, itemsList);
        await refreshData();
        return res;
      },
      approveQuotation: async (id, remarks) => {
        const res = await QuotationService.approve(id, currentUser.id, remarks);
        await refreshData();
        return res;
      },
      deleteQuotation: async (id) => {
        await QuotationService.delete(id);
        await refreshData();
      },
      
      createFollowUp: async (data) => {
        const res = await FollowUpService.create(data);
        await refreshData();
        return res;
      },
      updateFollowUp: async (id, data) => {
        const res = await FollowUpService.update(id, data);
        await refreshData();
        return res;
      },
      deleteFollowUp: async (id) => {
        await FollowUpService.delete(id);
        await refreshData();
      },
      
      createOrder: async (data, itemsList) => {
        const res = await OrderService.create(data, itemsList);
        await refreshData();
        return res;
      },
      convertQuotationToOrder: async (quotationId, poNumber, poDate, expectedDeliveryDate, remarks) => {
        const res = await OrderService.convertFromQuotation(quotationId, poNumber, poDate, expectedDeliveryDate, remarks);
        await refreshData();
        return res;
      },
      updateOrder: async (id, data) => {
        const res = await OrderService.update(id, data);
        await refreshData();
        return res;
      },
      deleteOrder: async (id) => {
        await OrderService.delete(id);
        await refreshData();
      },
      
      createDispatch: async (data, itemsList) => {
        const res = await DispatchService.create(data, itemsList);
        await refreshData();
        return res;
      },
      deleteDispatch: async (id) => {
        await DispatchService.delete(id);
        await refreshData();
      },
      
      createComplaint: async (data) => {
        const res = await ComplaintService.create(data);
        await refreshData();
        return res;
      },
      updateComplaint: async (id, data) => {
        const res = await ComplaintService.update(id, data);
        await refreshData();
        return res;
      },
      deleteComplaint: async (id) => {
        await ComplaintService.delete(id);
        await refreshData();
      },
      
      markNotificationRead: async (id) => {
        await NotificationService.markAsRead(id);
        await refreshData();
      },
      markAllNotificationsRead: async () => {
        await NotificationService.markAllAsRead();
        await refreshData();
      },
      
      isAuthenticated,
      sidebarCollapsed,
      setSidebarCollapsed,
      login,
      logout
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
