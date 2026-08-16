import { Item } from '../types';
import { getStore, saveStore, generateCode } from './localStore';

export const ItemService = {
  async getAll(): Promise<Item[]> {
    const store = getStore();
    return store.items;
  },

  async getById(id: string): Promise<Item | undefined> {
    const store = getStore();
    return store.items.find(i => i.id === id);
  },

  async getByCustomerId(customerId: string): Promise<Item[]> {
    const store = getStore();
    return store.items.filter(i => i.customer_id === customerId);
  },

  async findOrCreate(itemData: Omit<Item, 'id' | 'item_code' | 'created_at'>): Promise<Item> {
    const store = getStore();
    
    // Check if item with same drawing number and revision already exists
    const existing = store.items.find(
      i => i.drawing_number.toLowerCase() === itemData.drawing_number.toLowerCase() &&
           i.drawing_revision.toLowerCase() === itemData.drawing_revision.toLowerCase()
    );

    if (existing) {
      return existing;
    }

    const newId = `itm-${Date.now()}`;
    const newCode = generateCode('ITM', store.items);

    const newItem: Item = {
      ...itemData,
      id: newId,
      item_code: newCode,
      created_at: new Date().toISOString(),
    };

    store.items.unshift(newItem);
    saveStore(store);

    return newItem;
  },

  async update(id: string, updates: Partial<Item>): Promise<Item> {
    const store = getStore();
    const index = store.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Item not found');

    const updatedItem = {
      ...store.items[index],
      ...updates
    };

    store.items[index] = updatedItem;
    saveStore(store);

    return updatedItem;
  }
};
