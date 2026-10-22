'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, User, ShoppingBag, AlertOctagon, HelpCircle } from 'lucide-react';
import { useCRM } from './crm-provider';

interface SearchResult {
  type: 'Customer' | 'Enquiry' | 'Quotation' | 'Order' | 'Complaint';
  id: string;
  code: string;
  name: string;
  status: string;
  url: string;
}

export function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const { customers, enquiries, quotations, orders, complaints } = useCRM();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search Customers
    customers.forEach(c => {
      if (c.company_name.toLowerCase().includes(q) || c.customer_code.toLowerCase().includes(q) || c.contact_person.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'Customer',
          id: c.id,
          code: c.customer_code,
          name: c.company_name,
          status: c.status,
          url: `/customers?id=${c.id}`
        });
      }
    });

    // Search Enquiries
    enquiries.forEach(e => {
      const customer = customers.find(c => c.id === e.customer_id);
      if (e.enquiry_code.toLowerCase().includes(q) || e.requirement_description.toLowerCase().includes(q) || customer?.company_name.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'Enquiry',
          id: e.id,
          code: e.enquiry_code,
          name: customer ? `${customer.company_name} - ${e.requirement_description.substring(0, 30)}...` : e.requirement_description,
          status: e.status,
          url: `/enquiries?id=${e.id}`
        });
      }
    });

    // Search Quotations
    quotations.forEach(qu => {
      const customer = customers.find(c => c.id === qu.customer_id);
      if (qu.quotation_code.toLowerCase().includes(q) || customer?.company_name.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'Quotation',
          id: qu.id,
          code: qu.quotation_code,
          name: `Quotation for ${customer?.company_name || 'Customer'} - Total: ₹${qu.grand_total.toLocaleString()}`,
          status: qu.status,
          url: `/quotations?id=${qu.id}`
        });
      }
    });

    // Search Orders
    orders.forEach(o => {
      const customer = customers.find(c => c.id === o.customer_id);
      if (o.order_code.toLowerCase().includes(q) || o.po_number.toLowerCase().includes(q) || customer?.company_name.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'Order',
          id: o.id,
          code: o.order_code,
          name: `PO: ${o.po_number} - ${customer?.company_name || 'Customer'} - Total: ₹${o.total_amount.toLocaleString()}`,
          status: o.status,
          url: `/orders?id=${o.id}`
        });
      }
    });

    // Search Complaints
    complaints.forEach(co => {
      const customer = customers.find(c => c.id === co.customer_id);
      if (co.complaint_code.toLowerCase().includes(q) || co.complaint_type.toLowerCase().includes(q) || customer?.company_name.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'Complaint',
          id: co.id,
          code: co.complaint_code,
          name: `${co.complaint_type} - ${customer?.company_name || 'Customer'}`,
          status: co.status,
          url: `/complaints?id=${co.id}`
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to top 10
    setSelectedIndex(0);
  }, [query, customers, enquiries, quotations, orders, complaints]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (res: SearchResult) => {
    router.push(res.url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-900/40 backdrop-blur-sm">
      <div 
        ref={containerRef}
        className="w-full max-w-xl rounded-2xl overflow-hidden glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-2xl flex flex-col"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/40 dark:border-slate-800/40">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search customers, enquiries, quotes, orders..."
            className="w-full text-base bg-transparent border-none outline-none placeholder-slate-400 text-slate-800 dark:text-slate-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="text-xs px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400">ESC</span>
        </div>
        
        <div className="max-h-[350px] overflow-y-auto p-2">
          {query === '' ? (
            <div className="p-4 text-center text-sm text-slate-400">
              Type to search the database. Press <kbd className="font-sans px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border dark:border-slate-800">Ctrl</kbd> + <kbd className="font-sans px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border dark:border-slate-800">K</kbd> to toggle search palette anytime.
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">
              No results found matching "{query}"
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {results.map((res, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={res.id + '-' + res.type}
                    onClick={() => handleSelect(res)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                      isSelected 
                        ? 'bg-slate-900/5 dark:bg-slate-100/5 text-slate-900 dark:text-slate-100' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-slate-100/5'
                    }`}
                  >
                    {res.type === 'Customer' && <User className="w-4.5 h-4.5 text-blue-500 shrink-0" />}
                    {res.type === 'Enquiry' && <FileText className="w-4.5 h-4.5 text-amber-500 shrink-0" />}
                    {res.type === 'Quotation' && <FileText className="w-4.5 h-4.5 text-purple-500 shrink-0" />}
                    {res.type === 'Order' && <ShoppingBag className="w-4.5 h-4.5 text-emerald-500 shrink-0" />}
                    {res.type === 'Complaint' && <AlertOctagon className="w-4.5 h-4.5 text-rose-500 shrink-0" />}
                    
                    <div className="grow overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-400 dark:text-slate-500 shrink-0">{res.code}</span>
                        <span className="font-medium text-sm truncate text-slate-800 dark:text-slate-200">{res.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {res.type} &bull; <span className="opacity-80 font-medium">{res.status}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
