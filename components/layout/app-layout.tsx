'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { TopNav } from './top-nav';
import { useCRM } from '../crm-provider';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

// We will build and import the quick add forms
import { QuickCustomerForm } from '../customers/quick-customer-form';
import { QuickEnquiryForm } from '../enquiries/quick-enquiry-form';
import { QuickQuotationForm } from '../quotations/quick-quotation-form';
import { QuickFollowUpForm } from '../followups/quick-followup-form';
import { QuickOrderForm } from '../orders/quick-order-form';
import { QuickComplaintForm } from '../complaints/quick-complaint-form';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeQuickAdd, setActiveQuickAdd] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, isAuthenticated } = useCRM();

  const isPlainPage = pathname === '/' || pathname === '/login';

  // Auth Redirection Guard
  useEffect(() => {
    if (!isPlainPage && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isPlainPage, router]);

  const handleQuickAdd = (type: string) => {
    setActiveQuickAdd(type);
  };

  const closeQuickAdd = () => {
    setActiveQuickAdd(null);
  };

  if (isPlainPage) {
    return (
      <div className="min-h-screen text-slate-800 dark:text-slate-100 bg-[#f4f6fa] dark:bg-[#090b11] transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex text-slate-800 dark:text-slate-100 bg-[#f4f6fa] dark:bg-[#090b11] transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={mobileOpen} setIsMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      {/* 
        Plentiful padding on the left to accommodate the fixed sidebar:
        - Collapsed: 5rem (80px)
        - Expanded: 16rem (256px)
      */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-out-expo select-none ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        
        {/* Top Header Navigation */}
        <TopNav onMenuClick={() => setMobileOpen(true)} onQuickAdd={handleQuickAdd} />
        
        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Quick Add Modal Overlay */}
      <AnimatePresence>
        {activeQuickAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border glass-panel p-6 shadow-2xl flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-150 capitalize">
                  Quick Add: {activeQuickAdd}
                </h3>
                <button
                  onClick={closeQuickAdd}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div>
                {activeQuickAdd === 'customer' && <QuickCustomerForm onSuccess={closeQuickAdd} />}
                {activeQuickAdd === 'enquiry' && <QuickEnquiryForm onSuccess={closeQuickAdd} />}
                {activeQuickAdd === 'quotation' && <QuickQuotationForm onSuccess={closeQuickAdd} />}
                {activeQuickAdd === 'followup' && <QuickFollowUpForm onSuccess={closeQuickAdd} />}
                {activeQuickAdd === 'order' && <QuickOrderForm onSuccess={closeQuickAdd} />}
                {activeQuickAdd === 'complaint' && <QuickComplaintForm onSuccess={closeQuickAdd} />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
