'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { OrderSchema } from '../../lib/validations';
import { useCRM } from '../crm-provider';
import { useToast } from '../toast-provider';

type FormValues = z.infer<typeof OrderSchema>;

export function QuickOrderForm({ onSuccess }: { onSuccess: () => void }) {
  const { customers, quotations, convertQuotationToOrder, currentUser } = useCRM();
  const { toast } = useToast();

  const [filteredQuotes, setFilteredQuotes] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(OrderSchema),
    defaultValues: {
      order_date: new Date().toISOString().split('T')[0],
      po_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days standard
      sales_person_id: currentUser.id
    }
  });

  const watchedCustomerId = watch('customer_id');
  const watchedQuotationId = watch('quotation_id');

  // Filter quotations when customer changes
  useEffect(() => {
    if (watchedCustomerId) {
      const related = quotations.filter(
        q => q.customer_id === watchedCustomerId && 
        ['Approved', 'Sent', 'Negotiation', 'Accepted'].includes(q.status)
      );
      setFilteredQuotes(related);
      setValue('quotation_id', '');
      setSelectedQuote(null);
    } else {
      setFilteredQuotes([]);
      setSelectedQuote(null);
    }
  }, [watchedCustomerId, quotations, setValue]);

  // Sync quotation details when quotation changes
  useEffect(() => {
    if (watchedQuotationId) {
      const qObj = quotations.find(q => q.id === watchedQuotationId);
      if (qObj) {
        setSelectedQuote(qObj);
        setValue('payment_terms', qObj.payment_terms);
        setValue('delivery_terms', qObj.delivery_terms);
        setValue('sales_person_id', qObj.sales_person_id);
      }
    } else {
      setSelectedQuote(null);
    }
  }, [watchedQuotationId, quotations, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      await convertQuotationToOrder(
        data.quotation_id,
        data.po_number,
        new Date(data.po_date).toISOString(),
        new Date(data.expected_delivery_date).toISOString(),
        data.remarks
      );
      toast(`Sales Order registered successfully! Linked quotation status set to Accepted.`, 'success');
      onSuccess();
    } catch (e: any) {
      toast(e.message || 'Failed to convert quotation to order', 'error');
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

        {/* Quotation Reference */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Quotation Reference *</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('quotation_id')}
            disabled={!watchedCustomerId}
          >
            <option value="">-- Select Quotation --</option>
            {filteredQuotes.map(q => (
              <option key={q.id} value={q.id}>{q.quotation_code} (Grand Total: ₹{q.grand_total.toLocaleString()})</option>
            ))}
          </select>
          {errors.quotation_id && <p className="text-rose-500 text-xs mt-1">{errors.quotation_id.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PO Number */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">PO Number *</label>
          <input
            type="text"
            className="w-full glass-input text-sm"
            placeholder="e.g. PO-88992"
            {...register('po_number')}
          />
          {errors.po_number && <p className="text-rose-500 text-xs mt-1">{errors.po_number.message}</p>}
        </div>

        {/* PO Date */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">PO Date *</label>
          <input
            type="date"
            className="w-full glass-input text-sm"
            {...register('po_date')}
          />
          {errors.po_date && <p className="text-rose-500 text-xs mt-1">{errors.po_date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Confirmation Date */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Order Date *</label>
          <input
            type="date"
            className="w-full glass-input text-sm"
            {...register('order_date')}
          />
          {errors.order_date && <p className="text-rose-500 text-xs mt-1">{errors.order_date.message}</p>}
        </div>

        {/* Expected Delivery Date */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Exp. Delivery Date *</label>
          <input
            type="date"
            className="w-full glass-input text-sm"
            {...register('expected_delivery_date')}
          />
          {errors.expected_delivery_date && <p className="text-rose-500 text-xs mt-1">{errors.expected_delivery_date.message}</p>}
        </div>
      </div>

      {/* Show prefilled values from Quotation */}
      {selectedQuote && (
        <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs space-y-2">
          <span className="font-bold text-slate-700 dark:text-slate-350 block border-b pb-1">
            Prefilled Quotation Specifications
          </span>
          <div className="grid grid-cols-2 gap-2 text-slate-550 dark:text-slate-400">
            <div><span className="font-medium">Quoted Total:</span> <span className="font-bold text-slate-800 dark:text-slate-100">₹{selectedQuote.grand_total.toLocaleString()}</span></div>
            <div><span className="font-medium">Payment Terms:</span> {selectedQuote.payment_terms}</div>
            <div><span className="font-medium">Delivery Terms:</span> {selectedQuote.delivery_terms}</div>
            <div><span className="font-medium">Price Basis:</span> {selectedQuote.price_basis}</div>
          </div>
        </div>
      )}

      {/* Remarks */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Remarks</label>
        <textarea
          rows={2}
          className="w-full glass-input text-sm"
          placeholder="e.g. Schedule split in monthly batches of 500 pcs each..."
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
          disabled={isSubmitting || !watchedQuotationId}
          className="px-4 py-2 rounded-xl bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          {isSubmitting ? 'Converting...' : 'Create Order'}
        </button>
      </div>

    </form>
  );
}
