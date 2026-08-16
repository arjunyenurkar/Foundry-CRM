'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FollowUpSchema } from '../../lib/validations';
import { useCRM } from '../crm-provider';
import { useToast } from '../toast-provider';

type FormValues = z.infer<typeof FollowUpSchema>;

export function QuickFollowUpForm({ onSuccess }: { onSuccess: () => void }) {
  const { customers, enquiries, quotations, createFollowUp, currentUser, users } = useCRM();
  const { toast } = useToast();

  const [filteredEnquiries, setFilteredEnquiries] = useState<any[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<any[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(FollowUpSchema),
    defaultValues: {
      follow_up_date: new Date().toISOString().substring(0, 16), // datetime-local format
      follow_up_type: 'Call',
      assigned_to: currentUser.id,
      status: 'Scheduled',
      probability_percent: 50
    }
  });

  const watchedCustomerId = watch('customer_id');
  const watchedStatus = watch('status');

  // Load sibling records when customer changes
  useEffect(() => {
    if (watchedCustomerId) {
      const selectedCustomer = customers.find(c => c.id === watchedCustomerId);
      if (selectedCustomer) {
        setValue('contact_person', selectedCustomer.contact_person);
      }
      
      const relatedEnqs = enquiries.filter(e => e.customer_id === watchedCustomerId);
      setFilteredEnquiries(relatedEnqs);

      const relatedQuotes = quotations.filter(q => q.customer_id === watchedCustomerId);
      setFilteredQuotations(relatedQuotes);
    } else {
      setFilteredEnquiries([]);
      setFilteredQuotations([]);
    }
  }, [watchedCustomerId, customers, enquiries, quotations, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      await createFollowUp({
        ...data,
        follow_up_date: new Date(data.follow_up_date).toISOString(),
        next_follow_up_date: data.next_follow_up_date ? new Date(data.next_follow_up_date).toISOString() : undefined
      });
      toast('Follow-up activity recorded successfully!', 'success');
      onSuccess();
    } catch (e: any) {
      toast(e.message || 'Failed to save follow-up', 'error');
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

        {/* Contact Person */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Contact Person *</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('contact_person')}
          />
          {errors.contact_person && <p className="text-rose-500 text-xs mt-1">{errors.contact_person.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Related Enquiry */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Link to Enquiry</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('enquiry_id')}
            disabled={!watchedCustomerId}
          >
            <option value="">-- None --</option>
            {filteredEnquiries.map(e => (
              <option key={e.id} value={e.id}>{e.enquiry_code} - {e.requirement_description.substring(0, 30)}...</option>
            ))}
          </select>
        </div>

        {/* Related Quotation */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Link to Quotation</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('quotation_id')}
            disabled={!watchedCustomerId}
          >
            <option value="">-- None --</option>
            {filteredQuotations.map(q => (
              <option key={q.id} value={q.id}>{q.quotation_code} (Total: ₹{q.grand_total.toLocaleString()})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date & Time */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Date & Time *</label>
          <input
            type="datetime-local"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('follow_up_date')}
          />
          {errors.follow_up_date && <p className="text-rose-500 text-xs mt-1">{errors.follow_up_date.message}</p>}
        </div>

        {/* Follow-up Type */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Type</label>
          <select className="w-full glass-input text-sm" {...register('follow_up_type')}>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Site Visit">Site Visit</option>
            <option value="Video Call">Video Call</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Assigned Representative */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Assigned To</label>
          <select className="w-full glass-input text-sm" {...register('assigned_to')}>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label>
          <select className="w-full glass-input text-sm" {...register('status')}>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Probability */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Deal Probability (%)</label>
          <input
            type="number"
            className="w-full glass-input text-sm"
            {...register('probability_percent', { valueAsNumber: true })}
          />
        </div>

        {/* Next Follow Up Date */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Next Follow Up</label>
          <input
            type="date"
            className="w-full glass-input text-sm"
            disabled={watchedStatus !== 'Completed'}
            {...register('next_follow_up_date')}
          />
        </div>
      </div>

      {/* Discussion details */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Discussion Notes *</label>
        <textarea
          rows={3}
          className="w-full glass-input text-sm"
          placeholder="Details of discussion, customer reactions, pricing concerns..."
          {...register('discussion')}
        />
        {errors.discussion && <p className="text-rose-500 text-xs mt-1">{errors.discussion.message}</p>}
      </div>

      {/* Customer response (only if completed) */}
      {watchedStatus === 'Completed' && (
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Customer Final Feedback</label>
          <textarea
            rows={2}
            className="w-full glass-input text-sm"
            placeholder="What was the customer's response? e.g. Positive response, shared competitor pricing..."
            {...register('customer_response')}
          />
        </div>
      )}

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
          {isSubmitting ? 'Saving...' : 'Record Follow-up'}
        </button>
      </div>

    </form>
  );
}
