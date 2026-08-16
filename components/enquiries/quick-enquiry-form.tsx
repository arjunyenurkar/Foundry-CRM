'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnquirySchema } from '../../lib/validations';
import { useCRM } from '../crm-provider';
import { useToast } from '../toast-provider';
import { Plus, Trash2, HardDrive } from 'lucide-react';

// Extends EnquirySchema for form items including item creation inline
const FullFormSchema = EnquirySchema.extend({
  items: z.array(z.object({
    isNewItem: z.boolean().default(false),
    // Existing item select
    item_id: z.string().optional(),
    
    // New item creation fields (if isNewItem is true)
    new_item_name: z.string().optional(),
    new_drawing_number: z.string().optional(),
    new_drawing_revision: z.string().default('Rev 0'),
    new_material_grade: z.string().optional(),
    new_process: z.string().default('Sand Casting'),
    new_weight: z.coerce.number().default(1),
    
    // Quantity details
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    annual_requirement: z.coerce.number().optional(),
    machining_required: z.boolean().default(false),
    pattern_available: z.boolean().default(false),
    pattern_required: z.boolean().default(true),
    remarks: z.string().optional()
  })).min(1, 'At least one item requirement must be added')
});

type FormValues = z.infer<typeof FullFormSchema>;

export function QuickEnquiryForm({ onSuccess }: { onSuccess: () => void }) {
  const { customers, items: itemMaster, createEnquiry, createItem, currentUser, users } = useCRM();
  const { toast } = useToast();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(FullFormSchema),
    defaultValues: {
      enquiry_date: new Date().toISOString().split('T')[0],
      enquiry_source: 'Website',
      priority: 'Medium',
      sales_person_id: currentUser.id,
      items: [{
        isNewItem: false,
        item_id: '',
        new_item_name: '',
        new_drawing_number: '',
        new_drawing_revision: 'Rev 0',
        new_material_grade: 'FG 260',
        new_process: 'Sand Casting',
        new_weight: 5,
        quantity: 100,
        annual_requirement: 1200,
        machining_required: false,
        pattern_available: false,
        pattern_required: true
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  // Watch fields
  const watchedItems = watch('items');
  const watchedCustomerId = watch('customer_id');

  // Autofill contact person when customer changes
  React.useEffect(() => {
    if (watchedCustomerId) {
      const selected = customers.find(c => c.id === watchedCustomerId);
      if (selected) {
        setValue('contact_person', selected.contact_person);
        setValue('enquiry_source', selected.source);
      }
    }
  }, [watchedCustomerId, customers, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      const enquiryItemsPayload: any[] = [];

      for (let i = 0; i < data.items.length; i++) {
        const itemForm = data.items[i];
        let finalItemId = '';

        if (itemForm.isNewItem) {
          if (!itemForm.new_item_name || !itemForm.new_drawing_number || !itemForm.new_material_grade) {
            throw new Error(`Please fill in all details for New Item at row ${i + 1}`);
          }
          // Register item in Item Master
          const created = await createItem({
            item_name: itemForm.new_item_name,
            customer_id: data.customer_id,
            drawing_number: itemForm.new_drawing_number,
            drawing_revision: itemForm.new_drawing_revision,
            material_grade: itemForm.new_material_grade,
            process: itemForm.new_process,
            weight: itemForm.new_weight,
            unit: 'Pcs',
            pattern_status: itemForm.pattern_available ? 'Available' : 'Required',
            machining_status: itemForm.machining_required ? 'Machined' : 'Unmachined',
            active_status: true,
            remarks: 'Auto-created via Enquiry Form'
          });
          finalItemId = created.id;
        } else {
          if (!itemForm.item_id) {
            throw new Error(`Please select an item at row ${i + 1}`);
          }
          finalItemId = itemForm.item_id;
        }

        enquiryItemsPayload.push({
          item_id: finalItemId,
          quantity: itemForm.quantity,
          annual_requirement: itemForm.annual_requirement || itemForm.quantity * 12,
          machining_required: itemForm.machining_required,
          pattern_available: itemForm.pattern_available,
          pattern_required: itemForm.pattern_required,
          remarks: itemForm.remarks
        });
      }

      await createEnquiry({
        customer_id: data.customer_id,
        enquiry_date: new Date(data.enquiry_date).toISOString(),
        enquiry_source: data.enquiry_source,
        contact_person: data.contact_person,
        requirement_description: data.requirement_description,
        priority: data.priority,
        expected_order_date: data.expected_order_date ? new Date(data.expected_order_date).toISOString() : undefined,
        sales_person_id: data.sales_person_id,
        status: 'New',
        remarks: data.remarks
      }, enquiryItemsPayload);

      toast('Enquiry and item requirements saved successfully!', 'success');
      onSuccess();
    } catch (e: any) {
      toast(e.message || 'Failed to save enquiry', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      {/* Step 1: Enquiry Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Selection */}
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

        {/* Contact Person */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Contact Person *</label>
          <input
            type="text"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('contact_person')}
          />
          {errors.contact_person && <p className="text-rose-500 text-xs mt-1">{(errors.contact_person as any).message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Enquiry Date */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Enquiry Date *</label>
          <input
            type="date"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('enquiry_date')}
          />
          {errors.enquiry_date && <p className="text-rose-500 text-xs mt-1">{(errors.enquiry_date as any).message}</p>}
        </div>

        {/* Expected Order Date */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Exp. Order Date</label>
          <input
            type="date"
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('expected_order_date')}
          />
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Enquiry Source</label>
          <select
            className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
            {...register('enquiry_source')}
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

        {/* Sales Person Assignment */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Sales Person *</label>
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

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Requirement Description *</label>
        <textarea
          rows={3}
          className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
          placeholder="Enter detailed description of customer requirement..."
          {...register('requirement_description')}
        />
        {errors.requirement_description && <p className="text-rose-500 text-xs mt-1">{(errors.requirement_description as any).message}</p>}
      </div>

      {/* Step 2: Line Items / Requirements */}
      <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <HardDrive className="w-4.5 h-4.5 text-slate-400" />
            Requirement Items
          </h4>
          <button
            type="button"
            onClick={() => append({
              isNewItem: false,
              item_id: '',
              new_item_name: '',
              new_drawing_number: '',
              new_drawing_revision: 'Rev 0',
              new_material_grade: 'FG 260',
              new_process: 'Sand Casting',
              new_weight: 5,
              quantity: 100,
              annual_requirement: 1200,
              machining_required: false,
              pattern_available: false,
              pattern_required: true
            })}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>

        {fields.map((field, idx) => {
          const isNew = watchedItems[idx]?.isNewItem;
          return (
            <div 
              key={field.id} 
              className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 gap-4 mb-3 flex flex-col relative"
            >
              <div className="absolute top-3 right-3 flex items-center gap-4">
                {/* Checkbox New Item */}
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    className="rounded text-blue-500 dark:bg-slate-800 border-slate-300 focus:ring-0 w-3.5 h-3.5"
                    {...register(`items.${idx}.isNewItem`)}
                  />
                  New Casting Item
                </label>
                
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Item selection vs inline creation */}
              {!isNew ? (
                // SELECT EXISTING ITEM
                <div className="w-2/3 pr-8">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Select Item *</label>
                  <select
                    className="w-full glass-input text-sm text-slate-800 dark:text-slate-200"
                    {...register(`items.${idx}.item_id`)}
                  >
                    <option value="">-- Choose from Master List --</option>
                    {itemMaster.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.item_name} [{item.item_code} / Dwg: {item.drawing_number}]
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                // CREATE NEW CASTING ITEM
                <div className="space-y-3 pt-4">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                    Casting Item Specifications
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Item Name *</label>
                      <input
                        type="text"
                        className="w-full glass-input text-xs"
                        placeholder="e.g. Valve Bonnet Cover"
                        {...register(`items.${idx}.new_item_name`)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Drawing Number *</label>
                      <input
                        type="text"
                        className="w-full glass-input text-xs"
                        placeholder="e.g. DWG-VALV-002"
                        {...register(`items.${idx}.new_drawing_number`)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Material Grade *</label>
                      <input
                        type="text"
                        className="w-full glass-input text-xs"
                        placeholder="e.g. FG 260, SG 500/7"
                        {...register(`items.${idx}.new_material_grade`)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Process</label>
                      <select className="w-full glass-input text-xs" {...register(`items.${idx}.new_process`)}>
                        <option value="Sand Casting">Sand Casting</option>
                        <option value="Shell Moulding">Shell Moulding</option>
                        <option value="Investment Casting">Investment Casting</option>
                        <option value="HPDC">High Pressure Die Casting</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Unit Weight (KG)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full glass-input text-xs"
                        {...register(`items.${idx}.new_weight`)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Revision</label>
                      <input
                        type="text"
                        className="w-full glass-input text-xs"
                        {...register(`items.${idx}.new_drawing_revision`)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Common Quantity/Machining details */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-t border-slate-200/20 dark:border-slate-800/20 pt-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Quantity (Pcs) *</label>
                  <input
                    type="number"
                    className="w-full glass-input text-xs"
                    {...register(`items.${idx}.quantity`)}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Annual Req.</label>
                  <input
                    type="number"
                    className="w-full glass-input text-xs"
                    {...register(`items.${idx}.annual_requirement`)}
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer pt-3 font-medium">
                    <input
                      type="checkbox"
                      className="rounded text-blue-500 focus:ring-0 w-3.5 h-3.5"
                      {...register(`items.${idx}.machining_required`)}
                    />
                    Machining Required
                  </label>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer pt-3 font-medium">
                    <input
                      type="checkbox"
                      className="rounded text-blue-500 focus:ring-0 w-3.5 h-3.5"
                      {...register(`items.${idx}.pattern_available`)}
                    />
                    Pattern Available
                  </label>
                </div>
              </div>

            </div>
          );
        })}
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
          {isSubmitting ? 'Creating...' : 'Create Enquiry'}
        </button>
      </div>

    </form>
  );
}
