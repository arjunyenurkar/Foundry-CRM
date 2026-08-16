'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ComplaintSchema } from '../../lib/validations';
import { useCRM } from '../crm-provider';
import { useToast } from '../toast-provider';

type FormValues = z.infer<typeof ComplaintSchema>;

export function QuickComplaintForm({ onSuccess }: { onSuccess: () => void }) {
  const { customers, orders, orderItems, items: itemMaster, dispatches, createComplaint } = useCRM();
  const { toast } = useToast();

  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [filteredDispatches, setFilteredDispatches] = useState<any[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(ComplaintSchema),
    defaultValues: {
      complaint_date: new Date().toISOString().split('T')[0],
      severity: 'Medium',
      quantity_affected: 1
    }
  });

  const watchedCustomerId = watch('customer_id');
  const watchedOrderId = watch('order_id');

  // Filter orders and dispatches when customer changes
  useEffect(() => {
    if (watchedCustomerId) {
      const customerOrders = orders.filter(o => o.customer_id === watchedCustomerId);
      setFilteredOrders(customerOrders);
      
      const customerDispatches = dispatches.filter(d => d.customer_id === watchedCustomerId);
      setFilteredDispatches(customerDispatches);

      setValue('order_id', '');
      setValue('dispatch_id', '');
      setValue('item_id', '');
      setFilteredItems([]);
    } else {
      setFilteredOrders([]);
      setFilteredDispatches([]);
      setFilteredItems([]);
    }
  }, [watchedCustomerId, orders, dispatches, setValue]);

  // Filter items based on selected order
  useEffect(() => {
    if (watchedOrderId) {
      const selectedOrderItems = orderItems.filter(oi => oi.order_id === watchedOrderId);
      
      const mappedItems = selectedOrderItems.map(oi => {
        const itemObj = itemMaster.find(it => it.id === oi.item_id);
        return {
          id: oi.item_id,
          name: itemObj ? itemObj.item_name : 'Casting Item'
        };
      });

      setFilteredItems(mappedItems);
    } else {
      setFilteredItems([]);
    }
  }, [watchedOrderId, orderItems, itemMaster]);

  const onSubmit = async (data: FormValues) => {
    try {
      await createComplaint({
        ...data,
        complaint_date: new Date(data.complaint_date).toISOString(),
        order_id: data.order_id || undefined,
        item_id: data.item_id || undefined,
        dispatch_id: data.dispatch_id || undefined,
        status: 'Open'
      });
      toast(`Complaint registered successfully under tracking code!`, 'success');
      onSuccess();
    } catch (e: any) {
      toast(e.message || 'Failed to file complaint', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Customer *</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('customer_id')}
          >
            <option value="">-- Select Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.company_name} ({c.customer_code})</option>
            ))}
          </select>
          {errors.customer_id && <p className="text-rose-500 text-xs mt-1">{errors.customer_id.message}</p>}
        </div>

        {/* Link to Order */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Link to Order</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('order_id')}
            disabled={!watchedCustomerId}
          >
            <option value="">-- None / General --</option>
            {filteredOrders.map(o => (
              <option key={o.id} value={o.id}>{o.order_code} (PO: {o.po_number})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Link to Item */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Link to Item</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('item_id')}
            disabled={!watchedOrderId}
          >
            <option value="">-- Select Item --</option>
            {filteredItems.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        {/* Link to Dispatch */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Link to Dispatch / Invoice</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('dispatch_id')}
            disabled={!watchedCustomerId}
          >
            <option value="">-- None --</option>
            {filteredDispatches.map(d => (
              <option key={d.id} value={d.id}>{d.dispatch_code} (Inv: {d.invoice_number})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Complaint Date *</label>
          <input
            type="date"
            className="w-full glass-input text-sm"
            {...register('complaint_date')}
          />
          {errors.complaint_date && <p className="text-rose-500 text-xs mt-1">{errors.complaint_date.message}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Complaint Type *</label>
          <input
            type="text"
            className="w-full glass-input text-sm"
            placeholder="e.g. Blowholes, Dimensional Deviation"
            {...register('complaint_type')}
          />
          {errors.complaint_type && <p className="text-rose-500 text-xs mt-1">{errors.complaint_type.message}</p>}
        </div>

        {/* Severity */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Severity</label>
          <select className="w-full glass-input text-sm" {...register('severity')}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Qty Affected */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Qty Affected (Pcs) *</label>
          <input
            type="number"
            className="w-full glass-input text-sm"
            {...register('quantity_affected', { valueAsNumber: true })}
          />
          {errors.quantity_affected && <p className="text-rose-500 text-xs mt-1">{errors.quantity_affected.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Complaint Description *</label>
        <textarea
          rows={3}
          className="w-full glass-input text-sm"
          placeholder="Details of visual or mechanical defects, rejection rate at customer, etc..."
          {...register('description')}
        />
        {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Remarks</label>
        <textarea
          rows={2}
          className="w-full glass-input text-sm"
          placeholder="e.g. Customer demands immediate core review or replacements..."
          {...register('remarks')}
        />
      </div>

      <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 mt-6">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </div>

    </form>
  );
}
