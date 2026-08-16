'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomerSchema } from '../../lib/validations';
import { useCRM } from '../crm-provider';
import { useToast } from '../toast-provider';

type FormValues = z.infer<typeof CustomerSchema>;

export function QuickCustomerForm({ onSuccess }: { onSuccess: () => void }) {
  const { createCustomer, users, currentUser } = useCRM();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      customer_type: 'OEM',
      source: 'Website',
      priority: 'Medium',
      sales_person_id: currentUser.id,
      country: 'India',
      state: 'Tamil Nadu',
      city: 'Coimbatore'
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createCustomer({
        ...data,
        status: 'Prospect'
      });
      toast(`Customer '${data.company_name}' registered successfully!`, 'success');
      onSuccess();
    } catch (e: any) {
      toast(e.message || 'Failed to save customer', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Company Name *</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            placeholder="e.g. Apex Auto Components Ltd"
            {...register('company_name')}
          />
          {errors.company_name && <p className="text-rose-500 text-xs mt-1">{errors.company_name.message}</p>}
        </div>

        {/* Customer Type */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Customer Type *</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('customer_type')}
          >
            <option value="OEM">OEM</option>
            <option value="Tier 1">Tier 1</option>
            <option value="Distributor">Distributor</option>
            <option value="End User">End User</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Industry */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Industry *</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            placeholder="e.g. Automotive, Pumps, Valves"
            {...register('industry')}
          />
          {errors.industry && <p className="text-rose-500 text-xs mt-1">{errors.industry.message}</p>}
        </div>

        {/* Sales Person Assignment */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Assigned Salesperson *</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('sales_person_id')}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Person */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Contact Person *</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            placeholder="e.g. Rajesh Sharma"
            {...register('contact_person')}
          />
          {errors.contact_person && <p className="text-rose-500 text-xs mt-1">{errors.contact_person.message}</p>}
        </div>

        {/* Designation */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Designation *</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            placeholder="e.g. Purchase Manager"
            {...register('designation')}
          />
          {errors.designation && <p className="text-rose-500 text-xs mt-1">{errors.designation.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mobile */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Mobile Number *</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            placeholder="e.g. +91 98765 43210"
            {...register('mobile_number')}
          />
          {errors.mobile_number && <p className="text-rose-500 text-xs mt-1">{errors.mobile_number.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email *</label>
          <input
            type="email"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            placeholder="e.g. purchasing@apexauto.com"
            {...register('email')}
          />
          {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* City */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">City *</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('city')}
          />
          {errors.city && <p className="text-rose-500 text-xs mt-1">{errors.city.message}</p>}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">State *</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('state')}
          />
          {errors.state && <p className="text-rose-500 text-xs mt-1">{errors.state.message}</p>}
        </div>

        {/* Pin Code */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">PIN Code *</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            placeholder="641050"
            {...register('pin_code')}
          />
          {errors.pin_code && <p className="text-rose-500 text-xs mt-1">{errors.pin_code.message}</p>}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Office Address *</label>
        <textarea
          rows={2}
          className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
          placeholder="e.g. Plot No. 45, Industrial Estate, Coimbatore"
          {...register('address')}
        />
        {errors.address && <p className="text-rose-500 text-xs mt-1">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Source */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Source</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('source')}
          >
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Existing Customer">Existing Customer</option>
            <option value="Sales Visit">Sales Visit</option>
            <option value="Exhibition">Exhibition</option>
            <option value="Cold Call">Cold Call</option>
            <option value="Email">Email</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Priority</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('priority')}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Country</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('country')}
          />
        </div>
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
          {isSubmitting ? 'Saving...' : 'Register Customer'}
        </button>
      </div>

    </form>
  );
}
