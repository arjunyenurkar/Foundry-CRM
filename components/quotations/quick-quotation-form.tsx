'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QuotationSchema } from '../../lib/validations';
import { useCRM } from '../crm-provider';
import { useToast } from '../toast-provider';
import { Calculator } from 'lucide-react';

const FullFormSchema = QuotationSchema.extend({
  items: z.array(z.object({
    enquiry_item_id: z.string().min(1),
    item_id: z.string().min(1),
    item_name: z.string(),
    quantity: z.number(),
    rate: z.coerce.number().min(1, 'Rate must be greater than 0'),
    discount_percent: z.coerce.number().min(0).max(100),
    tax_percent: z.coerce.number().min(0).max(100),
    delivery_period_weeks: z.coerce.number().min(1)
  })).min(1, 'At least one quotation item is required')
});

type FormValues = z.infer<typeof FullFormSchema>;

export function QuickQuotationForm({ onSuccess }: { onSuccess: () => void }) {
  const { customers, enquiries, enquiryItems, items: itemMaster, createQuotation, currentUser } = useCRM();
  const { toast } = useToast();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [filteredEnquiries, setFilteredEnquiries] = useState<any[]>([]);

  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(FullFormSchema),
    defaultValues: {
      quotation_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days validity
      currency: 'INR',
      payment_terms: '30 Days Net',
      delivery_terms: 'Ex-Works Coimbatore',
      price_basis: 'Ex-Works',
      sales_person_id: currentUser.id,
      items: []
    }
  });

  const { fields, replace } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedCustomerId = watch('customer_id');
  const watchedEnquiryId = watch('enquiry_id');
  const watchedItems = watch('items');

  // Filter enquiries when customer changes
  useEffect(() => {
    if (watchedCustomerId) {
      const filtered = enquiries.filter(e => e.customer_id === watchedCustomerId && e.status !== 'Won' && e.status !== 'Lost');
      setFilteredEnquiries(filtered);
      setValue('enquiry_id', '');
      replace([]);
    } else {
      setFilteredEnquiries([]);
    }
  }, [watchedCustomerId, enquiries, setValue, replace]);

  // Load items from enquiry when enquiry is selected
  useEffect(() => {
    if (watchedEnquiryId) {
      const enqItems = enquiryItems.filter(ei => ei.enquiry_id === watchedEnquiryId);
      
      const qItems = enqItems.map(ei => {
        const itemObj = itemMaster.find(it => it.id === ei.item_id);
        
        // Estimate rate base (e.g. weight * 180 INR/kg)
        const estRate = itemObj ? Math.round(itemObj.weight * 180) : 100;

        return {
          enquiry_item_id: ei.id,
          item_id: ei.item_id,
          item_name: itemObj ? itemObj.item_name : 'Casting Item',
          quantity: ei.quantity,
          rate: estRate,
          discount_percent: 0,
          tax_percent: 18,
          delivery_period_weeks: 6
        };
      });

      replace(qItems);
    } else {
      replace([]);
    }
  }, [watchedEnquiryId, enquiryItems, itemMaster, replace]);

  // Programmatic live total calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    let discount = 0;
    
    if (watchedItems && watchedItems.length > 0) {
      watchedItems.forEach((item: any) => {
        const qty = item.quantity || 0;
        const rate = item.rate || 0;
        const discPercent = item.discount_percent || 0;
        const taxPercent = item.tax_percent || 0;

        const rowAmount = qty * rate;
        const rowDiscount = rowAmount * (discPercent / 100);
        const rowTax = (rowAmount - rowDiscount) * (taxPercent / 100);

        subtotal += rowAmount;
        discount += rowDiscount;
        tax += rowTax;
      });
    }

    return {
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax
    };
  };

  const totals = calculateTotals();

  const onSubmit = async (data: FormValues) => {
    try {
      const quotationItems = data.items.map(item => ({
        enquiry_item_id: item.enquiry_item_id,
        item_id: item.item_id,
        rate: item.rate,
        discount_percent: item.discount_percent,
        tax_percent: item.tax_percent,
        delivery_period_weeks: item.delivery_period_weeks
      }));

      await createQuotation({
        customer_id: data.customer_id,
        enquiry_id: data.enquiry_id,
        quotation_date: new Date(data.quotation_date).toISOString(),
        valid_until: new Date(data.valid_until).toISOString(),
        currency: data.currency,
        payment_terms: data.payment_terms,
        delivery_terms: data.delivery_terms,
        price_basis: data.price_basis,
        sales_person_id: data.sales_person_id,
        status: 'Draft',
        remarks: data.remarks,
        discount_percent: 2,
        tax_percent: 18
      }, quotationItems);

      toast('Quotation draft saved successfully!', 'success');
      onSuccess();
    } catch (e: any) {
      toast(e.message || 'Failed to save quotation', 'error');
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
          {errors.customer_id && <p className="text-rose-500 text-xs mt-1">{(errors.customer_id as any).message}</p>}
        </div>

        {/* Enquiry Reference */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Enquiry Reference *</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('enquiry_id')}
            disabled={!watchedCustomerId}
          >
            <option value="">-- Select Enquiry --</option>
            {filteredEnquiries.map(e => (
              <option key={e.id} value={e.id}>{e.enquiry_code} ({e.priority}) - {e.requirement_description.substring(0, 30)}...</option>
            ))}
          </select>
          {errors.enquiry_id && <p className="text-rose-500 text-xs mt-1">{(errors.enquiry_id as any).message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quotation Date */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Quotation Date *</label>
          <input
            type="date"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('quotation_date')}
          />
        </div>

        {/* Valid Until */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Valid Until *</label>
          <input
            type="date"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('valid_until')}
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Currency</label>
          <select className="w-full glass-input text-sm" {...register('currency')}>
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payment Terms */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Payment Terms *</label>
          <input
            type="text"
            className="w-full glass-input text-sm"
            placeholder="e.g. 30 Days Net"
            {...register('payment_terms')}
          />
        </div>

        {/* Delivery Terms */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Delivery Terms *</label>
          <input
            type="text"
            className="w-full glass-input text-sm"
            placeholder="e.g. Ex-Works Coimbatore"
            {...register('delivery_terms')}
          />
        </div>

        {/* Price Basis */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Price Basis *</label>
          <input
            type="text"
            className="w-full glass-input text-sm"
            placeholder="e.g. Ex-Works"
            {...register('price_basis')}
          />
        </div>
      </div>

      {/* Items Section */}
      {fields.length > 0 && (
        <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-6">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
            Quoted Pricing per Item
          </span>

          <div className="flex flex-col gap-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="p-4 rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-slate-900/1 dark:bg-slate-100/1 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/10 pb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                    Row {idx + 1}: {watchedItems[idx]?.item_name}
                  </span>
                  <span className="text-xs text-slate-450 dark:text-slate-500">
                    Qty: {watchedItems[idx]?.quantity} Pcs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Rate */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Rate / Unit *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full glass-input text-xs"
                      {...register(`items.${idx}.rate`)}
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Discount %</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      {...register(`items.${idx}.discount_percent`)}
                    />
                  </div>

                  {/* Tax */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tax %</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      {...register(`items.${idx}.tax_percent`)}
                    />
                  </div>

                  {/* Delivery weeks */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Delivery (Weeks)</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      {...register(`items.${idx}.delivery_period_weeks`)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="mt-4 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 glass-panel flex flex-col gap-1.5 w-72 ml-auto text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-slate-800 dark:text-slate-200">₹{totals.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-rose-500">
              <span>Discount Amount:</span>
              <span>- ₹{totals.discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-blue-500">
              <span>Tax Amount (GST):</span>
              <span>+ ₹{totals.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-50 border-t border-slate-200/40 dark:border-slate-800/40 pt-1.5 mt-1">
              <span>Grand Total:</span>
              <span>₹{totals.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Remarks */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Remarks</label>
        <textarea
          rows={2}
          className="w-full glass-input text-sm"
          placeholder="e.g. Terms valid subject to direct pattern availability..."
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
          disabled={isSubmitting || fields.length === 0}
          className="px-4 py-2 rounded-xl bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          {isSubmitting ? 'Creating...' : 'Draft Quotation'}
        </button>
      </div>

    </form>
  );
}
