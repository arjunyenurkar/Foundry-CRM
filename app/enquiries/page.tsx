'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCRM } from '../../components/crm-provider';
import { useToast } from '../../components/toast-provider';
import { 
  Search, Filter, ChevronRight, X, Eye, FileSpreadsheet, Plus,
  ClipboardList, ArrowRightLeft, ShieldCheck, FileText, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function EnquiriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const { 
    enquiries, customers, enquiryItems, items: itemMaster, 
    technicalEvaluations, updateEnquiry, hasPermission 
  } = useCRM();

  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  
  // Filtering & Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedEnquiryId(id);
    }
  }, [searchParams]);

  const handleSelectEnquiry = (id: string) => {
    setSelectedEnquiryId(id);
    router.push(`/enquiries?id=${id}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    setSelectedEnquiryId(null);
    router.push('/enquiries', { scroll: false });
  };

  // Change Enquiry Status manually (if authorized)
  const handleChangeStatus = async (id: string, newStatus: any) => {
    try {
      await updateEnquiry(id, { status: newStatus });
      toast(`Enquiry status updated to ${newStatus}`, 'success');
    } catch (e: any) {
      toast(e.message || 'Status update failed', 'error');
    }
  };

  // Filter list
  const filteredEnquiries = enquiries.filter(e => {
    const cust = customers.find(c => c.id === e.customer_id);
    const matchSearch = e.enquiry_code.toLowerCase().includes(search.toLowerCase()) ||
                        (cust && cust.company_name.toLowerCase().includes(search.toLowerCase())) ||
                        e.requirement_description.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || e.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  const selectedEnquiry = enquiries.find(e => e.id === selectedEnquiryId);
  const selectedCustomer = selectedEnquiry ? customers.find(c => c.id === selectedEnquiry.customer_id) : null;
  
  // Children EnquiryItems
  const selectedItems = selectedEnquiry ? enquiryItems.filter(ei => ei.enquiry_id === selectedEnquiry.id) : [];

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] relative overflow-hidden">
      
      {/* Master List */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedEnquiryId ? 'lg:w-[45%]' : 'w-full'}`}>
        
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search enquiries, customer..."
              className="w-full pl-9 pr-4 py-2 text-xs glass-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl py-2 px-3 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Technical Evaluation">Technical Evaluation</option>
              <option value="Quotation Pending">Quotation Pending</option>
              <option value="Quotation Sent">Quotation Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="grow overflow-y-auto glass-card">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 text-slate-500 uppercase border-b border-slate-200/30 dark:border-slate-800/30">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 hidden sm:table-cell">Date</th>
                <th className="py-3 px-4 hidden md:table-cell">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/20">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-450 font-medium">
                    No enquiries found matching filters.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map(e => {
                  const cust = customers.find(c => c.id === e.customer_id);
                  const isSelected = e.id === selectedEnquiryId;
                  return (
                    <tr
                      key={e.id}
                      onClick={() => handleSelectEnquiry(e.id)}
                      className={`hover:bg-slate-900/2 dark:hover:bg-slate-100/2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-500/5 dark:bg-blue-400/5 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-450 dark:text-slate-500">{e.enquiry_code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-slate-150">{cust ? cust.company_name : 'Unknown Customer'}</td>
                      <td className="py-3.5 px-4 hidden sm:table-cell text-slate-500 font-medium">
                        {format(new Date(e.enquiry_date), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-500 font-medium">{e.priority}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          e.status === 'Won' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                          e.status === 'Lost' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                          e.status === 'New' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                          e.status === 'Technical Evaluation' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-slate-400">
                        <ChevronRight className="w-4 h-4" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Enquiry Detail Panel */}
      {selectedEnquiry && selectedCustomer && (
        <div className="w-full lg:w-[50%] h-full rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-2xl flex flex-col overflow-hidden z-25 absolute lg:relative inset-y-0 right-0">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between">
            <div className="grow overflow-hidden pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {selectedEnquiry.enquiry_code} &bull; Contact: {selectedEnquiry.contact_person}
              </span>
              <h2 className="text-base font-bold text-slate-850 dark:text-slate-150 truncate mt-0.5 leading-snug">
                {selectedCustomer.company_name}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Status transition dropdown */}
              {hasPermission('update', 'enquiries') && (
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleChangeStatus(selectedEnquiry.id, e.target.value)}
                  className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-lg py-1.5 px-2 outline-none font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Technical Evaluation">Technical Evaluation</option>
                  <option value="Quotation Pending">Quotation Pending</option>
                  <option value="Quotation Sent">Quotation Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                  <option value="On Hold">On Hold</option>
                </select>
              )}
              <button
                onClick={handleCloseDetail}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-650"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          <div className="grow overflow-y-auto p-4 space-y-5 select-text">
            
            {/* Description Card */}
            <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Requirement Summary</span>
              <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                {selectedEnquiry.requirement_description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-4 border-t border-slate-200/20 pt-3 text-slate-500 font-semibold">
                <div>
                  <span className="text-slate-400 block font-normal">Date Received:</span>
                  {format(new Date(selectedEnquiry.enquiry_date), 'dd MMM yyyy')}
                </div>
                <div>
                  <span className="text-slate-400 block font-normal">Exp. Order Date:</span>
                  {selectedEnquiry.expected_order_date 
                    ? format(new Date(selectedEnquiry.expected_order_date), 'dd MMM yyyy')
                    : 'Not Specified'
                  }
                </div>
              </div>
            </div>

            {/* Child Items list */}
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-3">
                Items & Specifications
              </span>

              <div className="flex flex-col gap-3">
                {selectedItems.map((item, idx) => {
                  const masterItem = itemMaster.find(it => it.id === item.item_id);
                  const evalItem = technicalEvaluations.find(t => t.enquiry_item_id === item.id);

                  return (
                    <div 
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs"
                    >
                      <div className="flex justify-between items-start border-b border-slate-200/20 pb-2 mb-2">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">
                            {idx + 1}. {masterItem ? masterItem.item_name : 'Custom Casting Item'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-450 block mt-0.5">
                            Dwg: {masterItem?.drawing_number} &bull; Revision: {masterItem?.drawing_revision}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-750 dark:text-slate-150 block text-xs">Qty: {item.quantity} Pcs</span>
                          <span className="text-[10px] text-slate-400 block font-normal font-sans">Ann: {item.annual_requirement} Pcs</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-500 font-semibold mt-2">
                        <div><span className="text-slate-400 block font-normal">Process:</span> {masterItem?.process}</div>
                        <div><span className="text-slate-400 block font-normal">Weight:</span> {masterItem?.weight} KG</div>
                        <div><span className="text-slate-400 block font-normal">Machining:</span> {item.machining_required ? 'Yes' : 'No'}</div>
                        <div><span className="text-slate-400 block font-normal">Pattern:</span> {item.pattern_available ? 'Available' : 'Required'}</div>
                      </div>

                      {/* Feasibility status */}
                      <div className="flex items-center justify-between border-t border-slate-200/20 pt-2 mt-3.5">
                        <span className="text-[10px] flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${
                            evalItem?.status === 'Approved' ? 'bg-emerald-500' :
                            evalItem?.status === 'Rejected' ? 'bg-rose-500' :
                            'bg-amber-500'
                          }`} />
                          Feasibility Status: <span className="font-bold">{evalItem?.status || 'Pending'}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next actions/Workflow guidance */}
            <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Workflow Status Actions
              </span>
              
              <div className="flex flex-wrap gap-2.5">
                {selectedEnquiry.status === 'New' && (
                  <button 
                    onClick={() => handleChangeStatus(selectedEnquiry.id, 'Technical Evaluation')}
                    className="flex items-center gap-1 bg-indigo-500 text-slate-50 px-3 py-2 rounded-xl hover:opacity-95 transition-opacity text-xs font-bold"
                  >
                    Send to Feasibility <ArrowRightLeft className="w-4 h-4" />
                  </button>
                )}

                {selectedEnquiry.status === 'Quotation Pending' && (
                  <button 
                    onClick={() => {
                      // Navigate to quotation creation with params pre-loaded
                      toast('Navigating to draft a Quotation for this enquiry...', 'info');
                      router.push('/quotations');
                    }}
                    className="flex items-center gap-1 bg-emerald-500 text-slate-50 px-3 py-2 rounded-xl hover:opacity-95 transition-opacity text-xs font-bold"
                  >
                    Draft Quotation <FileText className="w-4 h-4" />
                  </button>
                )}

                {selectedEnquiry.status === 'Quotation Sent' && (
                  <button 
                    onClick={() => handleChangeStatus(selectedEnquiry.id, 'Negotiation')}
                    className="flex items-center gap-1 bg-amber-500 text-slate-50 px-3 py-2 rounded-xl hover:opacity-95 transition-opacity text-xs font-bold"
                  >
                    Start Negotiation <ArrowRightLeft className="w-4 h-4" />
                  </button>
                )}

                {['Quotation Sent', 'Negotiation'].includes(selectedEnquiry.status) && (
                  <>
                    <button 
                      onClick={() => {
                        toast('Navigate to Orders page to create order conversion', 'info');
                        router.push('/orders');
                      }}
                      className="flex items-center gap-1 bg-emerald-500 text-slate-50 px-3 py-2 rounded-xl hover:opacity-95 transition-opacity text-xs font-bold"
                    >
                      Convert to Order <CheckCircle className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleChangeStatus(selectedEnquiry.id, 'Lost')}
                      className="flex items-center gap-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-2 rounded-xl hover:bg-rose-500/20 transition-colors text-xs font-bold"
                    >
                      Mark Lost Opportunity
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
