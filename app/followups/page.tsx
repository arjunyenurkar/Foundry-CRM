'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCRM } from '../../components/crm-provider';
import { useToast } from '../../components/toast-provider';
import { 
  Search, Check, Calendar, CalendarClock, AlertCircle, 
  Phone, Mail, Users, ExternalLink, RefreshCw, X, MessageSquare, Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

export default function FollowUpsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { 
    followUps, customers, enquiries, quotations, 
    updateFollowUp, currentUser, users 
  } = useCRM();

  const [selectedFolId, setSelectedFolId] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Overdue' | 'Today' | 'Upcoming'>('all');
  
  // Completion form state
  const [completeRemarks, setCompleteRemarks] = useState('');
  const [nextFolDate, setNextFolDate] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedFolId(id);
    }
  }, [searchParams]);

  const handleMarkComplete = async (id: string, response: string, nextDate?: string) => {
    try {
      await updateFollowUp(id, {
        status: 'Completed',
        customer_response: response,
        next_follow_up_date: nextDate || undefined
      });
      toast('Follow-up marked as Completed!', 'success');
      setCompleteRemarks('');
      setNextFolDate('');
      setSelectedFolId(null);
    } catch (e: any) {
      toast('Failed to save followup completion', 'error');
    }
  };

  const getFilteredFollowups = () => {
    const today = new Date('2026-08-16T23:59:59Z');
    
    return followUps.filter(f => {
      const cust = customers.find(c => c.id === f.customer_id);
      const matchSearch = f.follow_up_code.toLowerCase().includes(search.toLowerCase()) ||
                          f.contact_person.toLowerCase().includes(search.toLowerCase()) ||
                          (cust && cust.company_name.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      const fDate = new Date(f.follow_up_date);

      if (filterType === 'Overdue') {
        return f.status === 'Scheduled' && fDate < new Date('2026-08-16T00:00:00Z');
      } else if (filterType === 'Today') {
        const itemDateStr = f.follow_up_date.split('T')[0];
        return f.status === 'Scheduled' && itemDateStr === '2026-08-16';
      } else if (filterType === 'Upcoming') {
        return f.status === 'Scheduled' && fDate > new Date('2026-08-16T23:59:59Z');
      }

      return true; // 'all'
    });
  };

  const filteredFol = getFilteredFollowups();
  const selectedFol = followUps.find(f => f.id === selectedFolId);
  const linkedCust = selectedFol ? customers.find(c => c.id === selectedFol.customer_id) : null;
  const linkedEnq = selectedFol?.enquiry_id ? enquiries.find(e => e.id === selectedFol.enquiry_id) : null;
  const linkedQuote = selectedFol?.quotation_id ? quotations.find(q => q.id === selectedFol.quotation_id) : null;

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] relative overflow-hidden">
      
      {/* Follow-up list */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedFolId ? 'lg:w-[50%]' : 'w-full'}`}>
        
        {/* Quick filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contact, customer..."
              className="w-full pl-9 pr-4 py-2 text-xs glass-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            {[
              { label: 'All Agenda', value: 'all' },
              { label: 'Overdue', value: 'Overdue' },
              { label: 'Today', value: 'Today' },
              { label: 'Upcoming', value: 'Upcoming' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterType(opt.value as any)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  filterType === opt.value 
                    ? 'bg-slate-900 border-slate-900 text-slate-100 dark:bg-slate-50 dark:border-slate-50 dark:text-slate-900' 
                    : 'border-slate-200/40 dark:border-slate-800/40 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of cards */}
        <div className="grow overflow-y-auto space-y-3 p-1">
          {filteredFol.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-450 font-semibold glass-card">
              No follow-ups found for this view.
            </div>
          ) : (
            filteredFol.map(f => {
              const cust = customers.find(c => c.id === f.customer_id);
              const rep = users.find(u => u.id === f.assigned_to);
              
              const fDate = new Date(f.follow_up_date);
              const isOverdue = f.status === 'Scheduled' && fDate < new Date('2026-08-16T00:00:00Z');
              const isToday = f.status === 'Scheduled' && f.follow_up_date.split('T')[0] === '2026-08-16';

              return (
                <div 
                  key={f.id}
                  onClick={() => setSelectedFolId(f.id)}
                  className={`p-4 rounded-xl border glass-panel backdrop-blur-md cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition-all flex items-start justify-between text-xs font-semibold ${
                    selectedFolId === f.id ? 'ring-2 ring-blue-500 border-transparent' : ''
                  }`}
                >
                  <div className="space-y-1.5 grow overflow-hidden pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">{f.follow_up_code}</span>
                      {isOverdue && <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide">Overdue</span>}
                      {isToday && <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide">Today</span>}
                      <span className="text-slate-500 uppercase text-[9px] tracking-wide">&bull; {f.follow_up_type}</span>
                    </div>

                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block truncate">
                      {cust ? cust.company_name : 'Unknown Customer'}
                    </span>
                    <p className="text-slate-450 leading-relaxed font-medium line-clamp-2">{f.discussion}</p>
                    
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 font-medium font-sans">
                      <span>Assigned to: {rep ? rep.name : 'Unknown'}</span>
                      {f.probability_percent && <span>Probability: {f.probability_percent}%</span>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block font-sans">
                      {format(new Date(f.follow_up_date), 'dd MMM yyyy')}
                    </span>
                    <span className="text-[9px] text-slate-450 block font-normal font-sans mt-0.5">
                      {format(new Date(f.follow_up_date), 'hh:mm a')}
                    </span>
                    
                    {f.status === 'Scheduled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFolId(f.id);
                        }}
                        className="mt-3 p-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-slate-50 rounded-lg transition-all"
                        title="Mark Complete"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Follow-up detailed slide-over panel */}
      {selectedFol && linkedCust && (
        <div className="w-full lg:w-[45%] h-full rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-2xl flex flex-col overflow-hidden z-25 absolute lg:relative inset-y-0 right-0">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                {selectedFol.follow_up_code} &bull; Status: {selectedFol.status}
              </span>
              <h2 className="text-base font-bold text-slate-850 dark:text-slate-150 truncate mt-0.5">
                {linkedCust.company_name}
              </h2>
            </div>
            <button
              onClick={() => setSelectedFolId(null)}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-650"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="grow overflow-y-auto p-4 space-y-4 select-text">
            
            {/* Meta details card */}
            <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide border-b pb-2 mb-3">
                Follow-up Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-slate-500 font-semibold">
                <div><span className="text-slate-400 block font-normal">Contact Person:</span> {selectedFol.contact_person}</div>
                <div><span className="text-slate-400 block font-normal">Type of Contact:</span> {selectedFol.follow_up_type}</div>
                <div><span className="text-slate-400 block font-normal">Schedule Date:</span> {format(new Date(selectedFol.follow_up_date), 'dd MMM yyyy hh:mm a')}</div>
                {selectedFol.probability_percent && (
                  <div><span className="text-slate-400 block font-normal">Opportunity Probability:</span> {selectedFol.probability_percent}%</div>
                )}
              </div>
              
              {/* Linked references */}
              {(linkedEnq || linkedQuote) && (
                <div className="mt-3.5 border-t border-slate-250/20 pt-3 text-[10px] space-y-1 text-slate-400 font-medium">
                  {linkedEnq && (
                    <div className="flex items-center gap-1">
                      <span>Linked Enquiry:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{linkedEnq.enquiry_code}</span>
                    </div>
                  )}
                  {linkedQuote && (
                    <div className="flex items-center gap-1">
                      <span>Linked Quotation:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{linkedQuote.quotation_code}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Discussion summary */}
            <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs">
              <span className="text-slate-400 font-bold block mb-1">Agenda / Discussion Notes</span>
              <p className="text-slate-750 dark:text-slate-300 font-semibold leading-relaxed">
                {selectedFol.discussion}
              </p>
            </div>

            {/* Mark Completed workflow box */}
            {selectedFol.status === 'Scheduled' && (
              <div className="p-4 rounded-xl border border-blue-500/10 dark:border-blue-400/10 bg-blue-500/5 dark:bg-blue-400/5 text-xs space-y-4">
                <span className="font-bold text-blue-500 uppercase tracking-wide block">
                  Record Follow-up Feedback / Resolution
                </span>

                <div className="space-y-3 font-semibold">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Customer Response Remarks *</label>
                    <textarea
                      rows={2.5}
                      className="w-full glass-input text-xs"
                      placeholder="e.g. Reviewed pricing, requested for 3% rebate on machining components..."
                      value={completeRemarks}
                      onChange={(e) => setCompleteRemarks(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Schedule Next Follow-up (Optional)</label>
                    <input
                      type="date"
                      className="w-full glass-input text-xs"
                      value={nextFolDate}
                      onChange={(e) => setNextFolDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => handleMarkComplete(selectedFol.id, completeRemarks, nextFolDate)}
                    disabled={!completeRemarks}
                    className="px-3.5 py-2 bg-emerald-500 text-slate-50 rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Confirm & Complete Task
                  </button>
                </div>
              </div>
            )}

            {/* Display Completed response if completed */}
            {selectedFol.status === 'Completed' && selectedFol.customer_response && (
              <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-xs text-emerald-600">
                <span className="font-bold block">Follow-up Verdict / Response:</span>
                <p className="mt-1 leading-normal">{selectedFol.customer_response}</p>
                {selectedFol.next_follow_up_date && (
                  <span className="block mt-2 text-[10px] text-slate-400 font-medium">
                    Next follow-up date auto-scheduled for: {format(new Date(selectedFol.next_follow_up_date), 'dd MMM yyyy')}
                  </span>
                )}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
