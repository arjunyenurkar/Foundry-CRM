'use client';

import React, { useState } from 'react';
import { useCRM } from '../../components/crm-provider';
import { useTheme } from '../../components/theme-provider';
import { useToast } from '../../components/toast-provider';
import { 
  User, Settings as SettingsIcon, Bell, Shield, 
  HelpCircle, RefreshCw, Key, Landmark, Sliders
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, resetDemoData } = useCRM();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Settings values
  const [quotationValidity, setQuotationValidity] = useState(30);
  const [taxPercent, setTaxPercent] = useState(18);
  const [currency, setCurrency] = useState('INR');
  const [reminderDays, setReminderDays] = useState(3);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast('System settings saved successfully (mocked).', 'success');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all mock databases back to factory defaults? This resets all leads, enquiries, quotations, and dispatches.')) {
      resetDemoData();
      toast('All database nodes reset to seed values.', 'success');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">CRM Configurations</p>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">System Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Hand tab selector links */}
        <div className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          <button className="flex items-center gap-2 px-3 py-2.5 bg-slate-900/5 dark:bg-slate-100/5 text-slate-900 dark:text-slate-100 rounded-xl w-full text-left">
            <User className="w-4.5 h-4.5" /> User Profile Info
          </button>
          <button className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-900/2 dark:hover:bg-slate-100/2 rounded-xl w-full text-left">
            <Sliders className="w-4.5 h-4.5" /> Sales Preferences
          </button>
          <button className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-900/2 dark:hover:bg-slate-100/2 rounded-xl w-full text-left">
            <Bell className="w-4.5 h-4.5" /> Notification Alerts
          </button>
          <button className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-900/2 dark:hover:bg-slate-100/2 text-rose-500 rounded-xl w-full text-left" onClick={handleReset}>
            <RefreshCw className="w-4.5 h-4.5" /> Reset Demo Databases
          </button>
        </div>

        {/* Configurations content panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Persona Card */}
          <div className="p-5 rounded-2xl glass-card text-xs">
            <h3 className="font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wide border-b pb-2 mb-4">
              Active User Persona
            </h3>
            
            <div className="flex items-center gap-4">
              <img 
                src={currentUser.avatar_url} 
                alt={currentUser.name} 
                className="w-14 h-14 rounded-full border border-slate-200 object-cover shrink-0 shadow"
              />
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">{currentUser.name}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">{currentUser.role}</span>
                <span className="text-[10px] text-slate-500 font-sans block">{currentUser.email}</span>
              </div>
            </div>
          </div>

          {/* Form settings */}
          <form onSubmit={handleSaveSettings} className="p-5 rounded-2xl glass-card text-xs space-y-4 font-semibold">
            <h3 className="font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wide border-b pb-2">
              Quotation & Commercial Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Validity */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Default Quotation Validity (Days)</label>
                <input
                  type="number"
                  className="w-full glass-input text-xs"
                  value={quotationValidity}
                  onChange={(e) => setQuotationValidity(Number(e.target.value))}
                />
              </div>

              {/* Tax */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Standard GST Tax Rate (%)</label>
                <input
                  type="number"
                  className="w-full glass-input text-xs"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Currency */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Standard Currency Base</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full glass-input text-xs font-semibold"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                </select>
              </div>

              {/* Alert follow up */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Follow-up Due Alerts Buffer (Days)</label>
                <input
                  type="number"
                  className="w-full glass-input text-xs"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Save Configurations
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}
