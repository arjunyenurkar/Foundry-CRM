'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCRM } from '../../components/crm-provider';
import { useToast } from '../../components/toast-provider';
import { 
  Search, ChevronRight, X, AlertTriangle, CheckCircle2, 
  HelpCircle, Settings, ClipboardCheck, Activity, Users, ShieldAlert
} from 'lucide-react';
import { format } from 'date-fns';

export default function ComplaintsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const { 
    complaints, customers, items: itemMaster, orders, 
    updateComplaint, users, hasPermission 
  } = useCRM();

  const [selectedCmpId, setSelectedCmpId] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // CAPA Resolution Form States
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [responsibleId, setResponsibleId] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [cmpStatus, setCmpStatus] = useState<any>('Resolved');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedCmpId(id);
    }
  }, [searchParams]);

  const handleSelectComplaint = (id: string) => {
    setSelectedCmpId(id);
    router.push(`/complaints?id=${id}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    setSelectedCmpId(null);
    router.push('/complaints', { scroll: false });
  };

  // Populate CAPA fields when complaint selection changes
  const selectedCmp = complaints.find(c => c.id === selectedCmpId);
  const linkedCust = selectedCmp ? customers.find(cu => cu.id === selectedCmp.customer_id) : null;
  const linkedItem = selectedCmp ? itemMaster.find(it => it.id === selectedCmp.item_id) : null;
  const linkedOrder = selectedCmp ? orders.find(o => o.id === selectedCmp.order_id) : null;

  useEffect(() => {
    if (selectedCmp) {
      setRootCause(selectedCmp.root_cause || '');
      setCorrectiveAction(selectedCmp.corrective_action || '');
      setPreventiveAction(selectedCmp.preventive_action || '');
      setResponsibleId(selectedCmp.responsible_person_id || 'usr-4'); // Default tech user
      setTargetDate(selectedCmp.target_resolution_date ? selectedCmp.target_resolution_date.split('T')[0] : '');
      setCmpStatus(selectedCmp.status === 'Open' || selectedCmp.status === 'Under Investigation' ? 'Resolved' : selectedCmp.status);
    }
  }, [selectedCmpId, selectedCmp]);

  const handleSaveCAPA = async () => {
    if (!selectedCmpId) return;

    try {
      const updates: any = {
        root_cause: rootCause,
        corrective_action: correctiveAction,
        preventive_action: preventiveAction,
        responsible_person_id: responsibleId,
        target_resolution_date: targetDate ? new Date(targetDate).toISOString() : undefined,
        status: cmpStatus
      };

      if (cmpStatus === 'Resolved' || cmpStatus === 'Closed') {
        updates.resolution_date = new Date().toISOString();
      }

      await updateComplaint(selectedCmpId, updates);
      toast('CAPA parameters and resolution logged successfully!', 'success');
      setSelectedCmpId(null);
    } catch (e: any) {
      toast('Failed to save resolution details', 'error');
    }
  };

  // Filter list
  const filteredComplaints = complaints.filter(c => {
    const cust = customers.find(cu => cu.id === c.customer_id);
    const matchSearch = c.complaint_code.toLowerCase().includes(search.toLowerCase()) ||
                        c.complaint_type.toLowerCase().includes(search.toLowerCase()) ||
                        (cust && cust.company_name.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] relative overflow-hidden">
      
      {/* Master List */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedCmpId ? 'lg:w-[45%]' : 'w-full'}`}>
        
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaints, customer..."
              className="w-full pl-9 pr-4 py-2 text-xs glass-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl py-2 px-3 outline-none"
            >
              <option value="all">All Complaints</option>
              <option value="Open">Open</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Action Required">Action Required</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="grow overflow-y-auto glass-card">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 text-slate-500 uppercase border-b border-slate-200/30 dark:border-slate-800/30">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Complaint Type</th>
                <th className="py-3 px-4 hidden sm:table-cell">Severity</th>
                <th className="py-3 px-4 hidden md:table-cell">Qty Affected</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/20">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-450 font-medium">
                    No customer complaints registered.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(c => {
                  const cust = customers.find(cu => cu.id === c.customer_id);
                  const isSelected = c.id === selectedCmpId;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectComplaint(c.id)}
                      className={`hover:bg-slate-900/2 dark:hover:bg-slate-100/2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-500/5 dark:bg-blue-400/5 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-450 dark:text-slate-500">{c.complaint_code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-slate-150">{cust ? cust.company_name : 'Unknown Customer'}</td>
                      <td className="py-3.5 px-4 text-rose-500 font-bold">{c.complaint_type}</td>
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          c.severity === 'Critical' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-450' :
                          c.severity === 'High' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' :
                          'bg-slate-100 dark:bg-slate-850 text-slate-500'
                        }`}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-600 dark:text-slate-400 font-medium font-mono">{c.quantity_affected} Pcs</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          c.status === 'Resolved' || c.status === 'Closed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                          'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}>
                          {c.status}
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

      {/* Complaint Detail slide-over panel */}
      {selectedCmp && linkedCust && (
        <div className="w-full lg:w-[50%] h-full rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-2xl flex flex-col overflow-hidden z-25 absolute lg:relative inset-y-0 right-0">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between">
            <div className="grow overflow-hidden pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ticket: {selectedCmp.complaint_code} &bull; Severity: {selectedCmp.severity}
              </span>
              <h2 className="text-base font-bold text-slate-850 dark:text-slate-150 truncate mt-0.5 leading-snug">
                {linkedCust.company_name}
              </h2>
            </div>
            <button
              onClick={handleCloseDetail}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-650"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="grow overflow-y-auto p-4 space-y-5 select-text">
            
            {/* Description & metadata */}
            <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Issue Reported</span>
                <p className="text-slate-750 dark:text-slate-350 leading-relaxed font-semibold">
                  {selectedCmp.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/20 text-slate-500 font-semibold">
                <div><span className="text-slate-400 block font-normal">Complaint Type:</span> {selectedCmp.complaint_type}</div>
                <div><span className="text-slate-400 block font-normal">Date Registered:</span> {format(new Date(selectedCmp.complaint_date), 'dd MMM yyyy')}</div>
                <div><span className="text-slate-400 block font-normal">Affected Quantity:</span> {selectedCmp.quantity_affected} Pcs</div>
                {linkedItem && (
                  <div>
                    <span className="text-slate-400 block font-normal">Casting Part:</span>
                    <span className="font-bold text-slate-750 dark:text-slate-250">{linkedItem.item_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CAPA Action Plan Section */}
            {hasPermission('update', 'technical') && ['Open', 'Under Investigation', 'Action Required'].includes(selectedCmp.status) ? (
              
              <div className="p-4 rounded-xl border border-rose-500/10 dark:border-rose-400/10 bg-rose-500/5 dark:bg-rose-400/5 text-xs space-y-4">
                <span className="font-bold text-rose-500 uppercase tracking-wide block">
                  CAPA Quality Audit & Resolution Log
                </span>

                <div className="space-y-3 font-semibold">
                  {/* Root Cause */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Root Cause Analysis (RCA) *</label>
                    <textarea
                      rows={2.5}
                      className="w-full glass-input text-xs"
                      placeholder="Identify metallurgical or molding causes, core defects, blowhole porosity reasons..."
                      value={rootCause}
                      onChange={(e) => setRootCause(e.target.value)}
                    />
                  </div>

                  {/* Corrective Action */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Corrective Action Plan *</label>
                    <textarea
                      rows={2}
                      className="w-full glass-input text-xs"
                      placeholder="Steps taken immediately: sorting stock, core box adjustments..."
                      value={correctiveAction}
                      onChange={(e) => setCorrectiveAction(e.target.value)}
                    />
                  </div>

                  {/* Preventive Action */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Preventive Action Plan</label>
                    <textarea
                      rows={2}
                      className="w-full glass-input text-xs"
                      placeholder="Steps to avoid future occurrence: molding sand audits, core drying times increase..."
                      value={preventiveAction}
                      onChange={(e) => setPreventiveAction(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Representative */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Quality Engineer</label>
                      <select
                        className="w-full glass-input text-xs"
                        value={responsibleId}
                        onChange={(e) => setResponsibleId(e.target.value)}
                      >
                        {users.filter(u => u.role === 'Technical User' || u.role === 'Admin').map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Target Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Target Close Date</label>
                      <input
                        type="date"
                        className="w-full glass-input text-xs"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status update */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Set Ticket Status *</label>
                    <select
                      className="w-full glass-input text-xs"
                      value={cmpStatus}
                      onChange={(e) => setCmpStatus(e.target.value)}
                    >
                      <option value="Resolved">Resolved (RCA & CAPA submitted)</option>
                      <option value="Closed">Closed (Confirmed with customer)</option>
                      <option value="Action Required">Action Required (Need more tests)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200/10">
                  <button
                    onClick={handleSaveCAPA}
                    disabled={!rootCause || !correctiveAction}
                    className="px-4 py-2 bg-rose-500 text-slate-50 rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Save & Resolve Complaint
                  </button>
                </div>
              </div>
            ) : (
              // Display resolved CAPA info if completed
              (selectedCmp.root_cause || selectedCmp.corrective_action) && (
                <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-xs text-emerald-600 space-y-3 font-semibold">
                  <h4 className="font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wide border-b pb-1.5">
                    <ClipboardCheck className="w-4 h-4" /> Logged RCA & CAPA Resolution
                  </h4>
                  
                  <div>
                    <span className="text-slate-400 block text-[9px] font-normal uppercase">Root Cause Analysis (RCA):</span>
                    <p className="text-slate-800 dark:text-slate-250 mt-0.5 leading-normal">{selectedCmp.root_cause}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] font-normal uppercase">Corrective Action Plan:</span>
                    <p className="text-slate-800 dark:text-slate-250 mt-0.5 leading-normal">{selectedCmp.corrective_action}</p>
                  </div>

                  {selectedCmp.preventive_action && (
                    <div>
                      <span className="text-slate-400 block text-[9px] font-normal uppercase">Preventive Action Plan:</span>
                      <p className="text-slate-800 dark:text-slate-250 mt-0.5 leading-normal">{selectedCmp.preventive_action}</p>
                    </div>
                  )}

                  {selectedCmp.resolution_date && (
                    <span className="block text-[9px] text-slate-400 font-normal pt-1 border-t border-slate-200/20">
                      Closed on: {format(new Date(selectedCmp.resolution_date), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  )}
                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}
