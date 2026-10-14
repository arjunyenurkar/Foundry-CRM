import { Order, OrderItem } from '../types';
import { supabase } from '../lib/supabaseClient';
import { generateCode, logActivity, getStoredUser } from './localStore';
import { QuotationService } from './quotations';

export const OrderService = {
  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    return data || [];
  },

  async getAllItems(): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*');

    if (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching order by id:', error);
      return undefined;
    }
    return data || undefined;
  },

  async getItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching items for order:', error);
      return [];
    }
    return data || [];
  },

  async create(
    orderData: Omit<Order, 'id' | 'order_code' | 'created_at' | 'updated_at'>,
    items: Omit<OrderItem, 'id' | 'order_id' | 'dispatched_quantity'>[]
  ): Promise<Order> {
    const existing = await this.getAll();
    const newCode = generateCode('ORD', existing);

    const cleanOrderData = {
      ...orderData,
      quotation_id: orderData.quotation_id && orderData.quotation_id.trim() !== '' ? orderData.quotation_id : null,
      sales_person_id: orderData.sales_person_id && orderData.sales_person_id.trim() !== '' ? orderData.sales_person_id : null,
      order_code: newCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newOrder, error: ordErr } = await supabase
      .from('orders')
      .insert(cleanOrderData)
      .select()
      .single();

    if (ordErr || !newOrder) {
      console.error('Error creating order:', ordErr);
      throw new Error(ordErr?.message || 'Failed to create sales order');
    }

    for (const item of items) {
      await supabase
        .from('order_items')
        .insert({
          ...item,
          order_id: newOrder.id,
          dispatched_quantity: 0
        });
    }

    await logActivity(
      orderData.customer_id,
      'order',
      newOrder.id,
      newCode,
      `Sales Order ${newCode} was confirmed under PO ${orderData.po_number}.`
    );

    return newOrder;
  },

  async convertFromQuotation(
    quotationId: string,
    poNumber: string,
    poDate: string,
    expectedDeliveryDate: string,
    remarks?: string
  ): Promise<Order> {
    const quotation = await QuotationService.getById(quotationId);
    if (!quotation) throw new Error('Quotation not found');

    const quotationItems = await QuotationService.getItemsByQuotationId(quotationId);

    // Fetch enquiry items for quantity
    const { data: enqItems } = await supabase.from('enquiry_items').select('id, quantity');

    const orderItemsPayload = quotationItems.map(qi => {
      const enqItem = enqItems?.find(ei => ei.id === qi.enquiry_item_id);
      const qty = enqItem ? enqItem.quantity : 1;
      return {
        quotation_item_id: qi.id,
        item_id: qi.item_id,
        quantity: qty,
        rate: qi.rate,
        amount: qi.amount
      };
    });

    // Check sales_person_id validity
    const storedUser = getStoredUser();
    const salesperson = quotation.sales_person_id || storedUser?.id || undefined;

    const newOrder = await this.create({
      customer_id: quotation.customer_id,
      quotation_id: quotation.id,
      po_number: poNumber,
      po_date: poDate,
      order_date: new Date().toISOString(),
      expected_delivery_date: expectedDeliveryDate,
      payment_terms: quotation.payment_terms || '30 Days Net',
      delivery_terms: quotation.delivery_terms || 'Ex-Works',
      sales_person_id: salesperson,
      status: 'Confirmed',
      total_amount: quotation.grand_total,
      remarks: remarks || `Converted from quotation ${quotation.quotation_code}`
    }, orderItemsPayload);

    // Update quotation status to Accepted
    await QuotationService.update(quotationId, { status: 'Accepted' });

    return newOrder;
  },

  async update(id: string, updates: Partial<Order>): Promise<Order> {
    const current = await this.getById(id);

    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating order:', error);
      throw new Error(error?.message || 'Failed to update order');
    }

    if (current && updates.status && updates.status !== current.status) {
      await logActivity(
        current.customer_id,
        'order',
        id,
        current.order_code,
        `Order status changed to ${updates.status}.`,
        'status_change'
      );
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const current = await this.getById(id);
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw new Error(error.message);

    if (current) {
      await logActivity(
        current.customer_id,
        'order',
        id,
        current.order_code,
        `Order ${current.order_code} deleted.`,
        'delete'
      );
    }
  }
};
