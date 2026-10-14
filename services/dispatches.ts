import { Dispatch, DispatchItem } from '../types';
import { supabase } from '../lib/supabaseClient';
import { generateCode, logActivity } from './localStore';

export const DispatchService = {
  async getAll(): Promise<Dispatch[]> {
    const { data, error } = await supabase
      .from('dispatches')
      .select('*')
      .order('dispatch_date', { ascending: false });

    if (error) {
      console.error('Error fetching dispatches:', error);
      return [];
    }
    return data || [];
  },

  async getAllItems(): Promise<DispatchItem[]> {
    const { data, error } = await supabase
      .from('dispatch_items')
      .select('*');

    if (error) {
      console.error('Error fetching dispatch items:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Dispatch | undefined> {
    const { data, error } = await supabase
      .from('dispatches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dispatch by id:', error);
      return undefined;
    }
    return data || undefined;
  },

  async getItemsByDispatchId(dispatchId: string): Promise<DispatchItem[]> {
    const { data, error } = await supabase
      .from('dispatch_items')
      .select('*')
      .eq('dispatch_id', dispatchId);

    if (error) {
      console.error('Error fetching items for dispatch:', error);
      return [];
    }
    return data || [];
  },

  async getByOrderId(orderId: string): Promise<Dispatch[]> {
    const { data, error } = await supabase
      .from('dispatches')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching dispatches for order:', error);
      return [];
    }
    return data || [];
  },

  async create(
    dispatchData: Omit<Dispatch, 'id' | 'dispatch_code' | 'created_at'>,
    items: { order_item_id: string; quantity: number }[]
  ): Promise<Dispatch> {
    const existing = await this.getAll();
    const newCode = generateCode('DSP', existing);

    const { data: newDispatch, error: dspErr } = await supabase
      .from('dispatches')
      .insert({
        ...dispatchData,
        dispatch_code: newCode,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dspErr || !newDispatch) {
      console.error('Error creating dispatch:', dspErr);
      throw new Error(dspErr?.message || 'Failed to create dispatch');
    }

    // Insert dispatch line items and update order items dispatched quantity
    for (const item of items) {
      await supabase
        .from('dispatch_items')
        .insert({
          dispatch_id: newDispatch.id,
          order_item_id: item.order_item_id,
          quantity: item.quantity
        });

      // Fetch current order item to increment dispatched_quantity
      const { data: ordItem } = await supabase
        .from('order_items')
        .select('dispatched_quantity, quantity')
        .eq('id', item.order_item_id)
        .single();

      if (ordItem) {
        const nextQty = (ordItem.dispatched_quantity || 0) + item.quantity;
        await supabase
          .from('order_items')
          .update({ dispatched_quantity: nextQty })
          .eq('id', item.order_item_id);
      }
    }

    // Update order status: check all items of this order
    const { data: allOrderItems } = await supabase
      .from('order_items')
      .select('quantity, dispatched_quantity')
      .eq('order_id', dispatchData.order_id);

    if (allOrderItems && allOrderItems.length > 0) {
      const allFullyDispatched = allOrderItems.every(oi => (oi.dispatched_quantity || 0) >= oi.quantity);
      const someDispatched = allOrderItems.some(oi => (oi.dispatched_quantity || 0) > 0);

      const nextStatus = allFullyDispatched ? 'Completed' : (someDispatched ? 'Partially Dispatched' : 'In Production');
      await supabase
        .from('orders')
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', dispatchData.order_id);
    }

    await logActivity(
      dispatchData.customer_id,
      'dispatch',
      newDispatch.id,
      newCode,
      `Dispatch consignment ${newCode} (Inv: ${dispatchData.invoice_number}) shipped via ${dispatchData.transporter}.`
    );

    return newDispatch;
  },

  async delete(id: string): Promise<void> {
    const current = await this.getById(id);
    const { error } = await supabase.from('dispatches').delete().eq('id', id);
    if (error) throw new Error(error.message);

    if (current) {
      await logActivity(
        current.customer_id,
        'dispatch',
        id,
        current.dispatch_code,
        `Dispatch record ${current.dispatch_code} deleted.`,
        'delete'
      );
    }
  }
};
