import { Dispatch, DispatchItem, DispatchStatus, OrderItem } from '../types';
import { getStore, saveStore, generateCode, logActivity } from './localStore';

export const DispatchService = {
  async getAll(): Promise<Dispatch[]> {
    const store = getStore();
    return store.dispatches;
  },

  async getById(id: string): Promise<Dispatch | undefined> {
    const store = getStore();
    return store.dispatches.find(d => d.id === id);
  },

  async getItemsByDispatchId(dispatchId: string): Promise<DispatchItem[]> {
    const store = getStore();
    return store.dispatchItems.filter(di => di.dispatch_id === dispatchId);
  },

  async getByOrderId(orderId: string): Promise<Dispatch[]> {
    const store = getStore();
    return store.dispatches.filter(d => d.order_id === orderId);
  },

  async create(
    dispatchData: Omit<Dispatch, 'id' | 'dispatch_code' | 'created_at'>,
    items: { order_item_id: string; quantity: number }[]
  ): Promise<Dispatch> {
    const store = getStore();
    const newId = `dsp-${Date.now()}`;
    const newCode = generateCode('DSP', store.dispatches);

    const newDispatch: Dispatch = {
      ...dispatchData,
      id: newId,
      dispatch_code: newCode,
      created_at: new Date().toISOString(),
    };

    store.dispatches.unshift(newDispatch);

    // Update dispatch quantities on individual order items
    items.forEach((item, idx) => {
      const dispatchItemId = `dsp-item-${Date.now()}-${idx}`;
      store.dispatchItems.push({
        id: dispatchItemId,
        dispatch_id: newId,
        order_item_id: item.order_item_id,
        quantity: item.quantity
      });

      // Find order item and update its dispatched quantity
      const orderItem = store.orderItems.find(oi => oi.id === item.order_item_id);
      if (orderItem) {
        orderItem.dispatched_quantity = (orderItem.dispatched_quantity || 0) + item.quantity;
      }
    });

    // Check if the overall order is fully completed, partially completed, or confirmed
    const order = store.orders.find(o => o.id === dispatchData.order_id);
    if (order) {
      const orderItemsList = store.orderItems.filter(oi => oi.order_id === order.id);
      const totalOrdered = orderItemsList.reduce((sum, item) => sum + item.quantity, 0);
      const totalDispatched = orderItemsList.reduce((sum, item) => sum + (item.dispatched_quantity || 0), 0);

      if (totalDispatched >= totalOrdered) {
        order.status = 'Completed';
      } else if (totalDispatched > 0) {
        order.status = 'Partially Dispatched';
      }
      order.updated_at = new Date().toISOString();
    }

    saveStore(store);
    logActivity(dispatchData.customer_id, 'dispatch', newId, newCode, `Dispatch invoice ${dispatchData.invoice_number} processed via ${dispatchData.transporter}.`);

    return newDispatch;
  },

  async getOrderQuantities(orderId: string): Promise<{ ordered: number; dispatched: number; balance: number }> {
    const store = getStore();
    const orderItemsList = store.orderItems.filter(oi => oi.order_id === orderId);
    const ordered = orderItemsList.reduce((sum, item) => sum + item.quantity, 0);
    const dispatched = orderItemsList.reduce((sum, item) => sum + (item.dispatched_quantity || 0), 0);
    return {
      ordered,
      dispatched,
      balance: Math.max(0, ordered - dispatched)
    };
  }
};
