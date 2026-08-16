import { Order, OrderItem, OrderStatus } from '../types';
import { getStore, saveStore, generateCode, logActivity } from './localStore';
import { QuotationService } from './quotations';

export const OrderService = {
  async getAll(): Promise<Order[]> {
    const store = getStore();
    return store.orders;
  },

  async getById(id: string): Promise<Order | undefined> {
    const store = getStore();
    return store.orders.find(o => o.id === id);
  },

  async getItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    const store = getStore();
    return store.orderItems.filter(oi => oi.order_id === orderId);
  },

  async create(
    orderData: Omit<Order, 'id' | 'order_code' | 'created_at' | 'updated_at'>,
    items: Omit<OrderItem, 'id' | 'order_id' | 'dispatched_quantity'>[]
  ): Promise<Order> {
    const store = getStore();
    const newId = `ord-${Date.now()}`;
    const newCode = generateCode('ORD', store.orders);

    const newOrder: Order = {
      ...orderData,
      id: newId,
      order_code: newCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.orders.unshift(newOrder);

    items.forEach((item, idx) => {
      const orderItemId = `ord-item-${Date.now()}-${idx}`;
      store.orderItems.push({
        ...item,
        id: orderItemId,
        order_id: newId,
        dispatched_quantity: 0
      });
    });

    saveStore(store);
    logActivity(orderData.customer_id, 'order', newId, newCode, `Sales Order ${newCode} was confirmed under PO ${orderData.po_number}.`);

    return newOrder;
  },

  async convertFromQuotation(
    quotationId: string, 
    poNumber: string, 
    poDate: string, 
    expectedDeliveryDate: string,
    remarks?: string
  ): Promise<Order> {
    const store = getStore();
    const q = store.quotations.find(item => item.id === quotationId);
    if (!q) throw new Error('Quotation not found');

    // 1. Update quotation status to Accepted
    q.status = 'Accepted';
    q.updated_at = new Date().toISOString();

    // 2. Update enquiry status to Won
    const enq = store.enquiries.find(e => e.id === q.enquiry_id);
    if (enq) {
      enq.status = 'Won';
      enq.updated_at = new Date().toISOString();
    }

    // 3. Get quotation items
    const qItems = store.quotationItems.filter(qi => qi.quotation_id === quotationId);

    // 4. Set order items structure
    const orderItemsToCreate = qItems.map(qi => {
      // Find enquiry item to get correct quantity
      const enqItem = store.enquiryItems.find(ei => ei.id === qi.enquiry_item_id);
      const qty = enqItem ? enqItem.quantity : 1;
      return {
        quotation_item_id: qi.id,
        item_id: qi.item_id,
        quantity: qty,
        rate: qi.rate,
        amount: qi.rate * qty
      };
    });

    // 5. Create Order
    const order = await this.create({
      customer_id: q.customer_id,
      quotation_id: q.id,
      po_number: poNumber,
      po_date: poDate,
      order_date: new Date().toISOString(),
      expected_delivery_date: expectedDeliveryDate,
      payment_terms: q.payment_terms,
      delivery_terms: q.delivery_terms,
      sales_person_id: q.sales_person_id,
      status: 'Confirmed',
      total_amount: q.grand_total,
      remarks: remarks || `Converted from quotation ${q.quotation_code}`
    }, orderItemsToCreate);

    return order;
  },

  async update(id: string, updates: Partial<Order>): Promise<Order> {
    const store = getStore();
    const index = store.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const oldVal = store.orders[index];
    const updatedOrder = {
      ...oldVal,
      ...updates,
      updated_at: new Date().toISOString()
    };

    store.orders[index] = updatedOrder;
    saveStore(store);

    if (updates.status && updates.status !== oldVal.status) {
      logActivity(
        oldVal.customer_id,
        'order',
        id,
        oldVal.order_code,
        `Order status updated from ${oldVal.status} to ${updates.status}.`,
        'status_change'
      );
    } else {
      logActivity(oldVal.customer_id, 'order', id, oldVal.order_code, `Order details updated.`, 'update');
    }

    return updatedOrder;
  },

  async delete(id: string): Promise<void> {
    const store = getStore();
    const index = store.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const ord = store.orders[index];
    store.orders = store.orders.filter(o => o.id !== id);
    store.orderItems = store.orderItems.filter(oi => oi.order_id !== id);

    saveStore(store);
    logActivity(ord.customer_id, 'order', id, ord.order_code, `Order ${ord.order_code} deleted.`, 'delete');
  }
};
