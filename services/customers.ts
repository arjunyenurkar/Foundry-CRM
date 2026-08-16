import { Customer, CustomerStatus } from '../types';
import { getStore, saveStore, generateCode, logActivity } from './localStore';

export const CustomerService = {
  async getAll(): Promise<Customer[]> {
    const store = getStore();
    return store.customers;
  },

  async getById(id: string): Promise<Customer | undefined> {
    const store = getStore();
    return store.customers.find(c => c.id === id);
  },

  async create(customerData: Omit<Customer, 'id' | 'customer_code' | 'created_at'>): Promise<Customer> {
    const store = getStore();
    const newId = `cus-${Date.now()}`;
    const newCode = generateCode('CUS', store.customers);

    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      customer_code: newCode,
      created_at: new Date().toISOString(),
    };

    store.customers.unshift(newCustomer);
    saveStore(store);

    logActivity(newId, 'customer', newId, newCode, `Customer/Prospect '${customerData.company_name}' was registered.`);
    return newCustomer;
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const store = getStore();
    const index = store.customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');

    const oldVal = store.customers[index];
    const updatedCustomer = {
      ...oldVal,
      ...updates,
    };

    store.customers[index] = updatedCustomer;
    saveStore(store);

    if (updates.status && updates.status !== oldVal.status) {
      logActivity(
        id, 
        'customer', 
        id, 
        oldVal.customer_code, 
        `Customer status changed from ${oldVal.status} to ${updates.status}.`,
        'status_change'
      );
    } else {
      logActivity(id, 'customer', id, oldVal.customer_code, `Customer profile updated.`, 'update');
    }

    return updatedCustomer;
  },

  async delete(id: string): Promise<void> {
    const store = getStore();
    const customer = store.customers.find(c => c.id === id);
    if (!customer) throw new Error('Customer not found');
    
    // Instead of full deletion, we can mark as Inactive or delete for mock simplicity
    store.customers = store.customers.filter(c => c.id !== id);
    saveStore(store);
    logActivity(id, 'customer', id, customer.customer_code, `Customer '${customer.company_name}' deleted.`, 'delete');
  },

  async convertLead(id: string): Promise<Customer> {
    return this.update(id, { status: 'Active' });
  }
};
