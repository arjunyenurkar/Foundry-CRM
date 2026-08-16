'use client';

import React, { useState } from 'react';
import { useCRM } from '../../components/crm-provider';
import { useToast } from '../../components/toast-provider';
import { 
  Search, Filter, ChevronRight, X, CheckSquare, AlertTriangle, 
  HelpCircle, Settings, FileText, CheckCircle2, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

export default function TechnicalPage() {
  const { 
    technicalEvaluations, enquiries, items: itemMaster, customers, enquiryItems,
    updateTechnicalEvaluation, currentUser, hasPermission 
  } = useCRM();

  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeId, setSelectedTeId] = useState<string | null>(null);

  // Feasibility questionnaire form state
  const [materialFeasible, setMaterialFeasible] = useState(true);
  const [castingFeasible, setCastingFeasible] = useState(true);
  const [patternFeasible, setPatternFeasible] = useState(true);
  const [machiningFeasible, setMachiningFeasible] = useState(true);
  const [qualityFeasible, setQualityFeasible] = useState(true);
  
  const [estWeight, setEstWeight] = useState(1);
  const [estScrap, setEstScrap] = useState(5.0);
  const [estCycleTime, setEstCycleTime] = useState(15);
  const [remarks, setRemarks] = useState('');
  const [statusVal, setStatusVal] = useState<'Approved' | 'Rejected' | 'Revision Required'>('Approved');

  const filteredTes = technicalEvaluations.filter(te => {
    const enq = enquiries.find(e => e.id === te.enquiry_id);
    const enqItem = enquiryItems.find(ei => ei.id === te.enquiry_item_id);
    const itemObj = enqItem ? itemMaster.find(it => it.id === enqItem.item_id) : null;
    const cust = enq ? customers.find(c => c.id === enq.customer_id) : null;

    const matchSearch = (enq && enq.enquiry_code.toLowerCase().includes(search.toLowerCase())) ||
                        (itemObj && itemObj.item_name.toLowerCase().includes(search.toLowerCase())) ||
                        (cust && cust.company_name.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'all' || te.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleOpenEvaluation = (te: any) => {
    // Populate form states
    setSelectedTeId(te.id);
    setMaterialFeasible(te.material_feasibility);
    setCastingFeasible(te.casting_feasibility);
    setPatternFeasible(te.pattern_feasible || te.pattern_feasibility || false);
    setMachiningFeasible(te.machining_feasible || te.machining_feasibility || false);
    setQualityFeasible(te.quality_requirement_feasible || false);
    setEstWeight(te.estimated_weight || 1);
    setEstScrap(te.estimated_scrap_percent || 5.0);
    setEstCycleTime(te.estimated_cycle_time_mins || 15);
    setRemarks(te.technical_remarks || '');
    setStatusVal(te.status === 'Pending' || te.status === 'Under Evaluation' ? 'Approved' : te.status);
  };

  const handleSaveEvaluation = async () => {
    if (!selectedTeId) return;

    // Check permissions
    if (!hasPermission('update', 'technical')) {
      toast('Unauthorized: Only Technical Users or Admin can submit feasibility reviews.', 'error');
      return;
    }

    try {
      await updateTechnicalEvaluation(selectedTeId, {
        material_feasibility: materialFeasible,
        casting_feasibility: castingFeasible,
        pattern_feasibility: patternFeasible,
        machining_feasibility: machiningFeasible,
        quality_requirement_feasible: qualityFeasible,
        estimated_weight: Number(estWeight),
        estimated_scrap_percent: Number(estScrap),
        estimated_cycle_time_mins: Number(estCycleTime),
        technical_remarks: remarks,
        status: statusVal,
        evaluator_id: currentUser.id,
        evaluation_date: new Date().toISOString()
      });

      toast('Technical Feasibility evaluation saved successfully!', 'success');
      setSelectedTeId(null);
    } catch (e: any) {
      toast(e.message || 'Failed to save feasibility review', 'error');
    }
  };

  // Find detailed data for modal
  const selectedTe = technicalEvaluations.find(te => te.id === selectedTeId);
  const selectedEnq = selectedTe ? enquiries.find(e => e.id === selectedTe.enquiry_id) : null;
  const selectedCustomer = selectedEnq ? customers.find(c => c.id === selectedEnq.customer_id) : null;
  const selectedEnqItem = selectedTe ? enquiryItems.find(ei => ei.id === selectedTe.enquiry_item_id) : null;
  const selectedItemObj = selectedEnqItem ? itemMaster.find(i => i.id === selectedEnqItem.item_id) : null;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Methodology & Feasibility Audits</p>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Technical Casting Feasibility</h1>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search feasibility, enquiry code, customer..."
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
            <option value="all">All Feasibility Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Evaluation">Under Evaluation</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Revision Required">Revision Required</option>
          </select>
        </div>
      </div>

      {/* Feasibility Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full border-collapse text-left text-xs font-semibold">
          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 uppercase border-b border-slate-200/30 dark:border-slate-800/30">
            <tr>
              <th className="py-3 px-4">Enquiry</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Casting Item</th>
              <th className="py-3 px-4">Drawing Num</th>
              <th className="py-3 px-4">Est. Weight</th>
              <th className="py-3 px-4">Feasibility status</th>
              <th className="py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/20">
            {filteredTes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-450 font-medium">
                  No technical evaluations found matching criteria.
                </td>
              </tr>
            ) : (
              filteredTes.map(te => {
                const enq = enquiries.find(e => e.id === te.enquiry_id);
                const cust = enq ? customers.find(c => c.id === enq.customer_id) : null;
                const enqItem = enquiryItems.find(ei => ei.id === te.enquiry_item_id);
                const itemObj = enqItem ? itemMaster.find(it => it.id === enqItem.item_id) : null;
                
                return (
                  <tr 
                    key={te.id} 
                    onClick={() => handleOpenEvaluation(te)}
                    className="hover:bg-slate-900/2 dark:hover:bg-slate-100/2 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-slate-150">{enq ? enq.enquiry_code : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-450">{cust ? cust.company_name : 'N/A'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-750 dark:text-slate-200">{itemObj ? itemObj.item_name : 'Custom Casting'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{itemObj ? itemObj.drawing_number : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-350">{te.estimated_weight ? `${te.estimated_weight} KG` : 'Not Evaluated'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        te.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                        te.status === 'Pending' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                        te.status === 'Rejected' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                        'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}>
                        {te.status}
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

      {/* Technical Feasibility Form Modal */}
      {selectedTe && selectedCustomer && selectedItemObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border glass-panel p-6 shadow-2xl flex flex-col gap-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-sans">
                  Enquiry: {selectedEnq?.enquiry_code} &bull; Item: {selectedItemObj.item_code}
                </span>
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-150">
                  Feasibility Review - {selectedCustomer.company_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTeId(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-650"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feasibility Checklist Form */}
            <div className="space-y-4 text-xs font-semibold">
              
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                FEASIBILITY MATRIX CHECKLIST
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Material Feasibility */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-slate-900/1 dark:bg-slate-100/1">
                  <span>Material Chemistry & Grade Feasible?</span>
                  <input
                    type="checkbox"
                    checked={materialFeasible}
                    onChange={(e) => setMaterialFeasible(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 2. Casting Feasibility */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-slate-900/1 dark:bg-slate-100/1">
                  <span>Molding & Pouring Feasible?</span>
                  <input
                    type="checkbox"
                    checked={castingFeasible}
                    onChange={(e) => setCastingFeasible(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 3. Pattern Feasibility */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-slate-900/1 dark:bg-slate-100/1">
                  <span>Core Patterns / Tooling Feasible?</span>
                  <input
                    type="checkbox"
                    checked={patternFeasible}
                    onChange={(e) => setPatternFeasible(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* 4. Machining Feasibility */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-slate-900/1 dark:bg-slate-100/1">
                  <span>Post-Casting Machining Feasible?</span>
                  <input
                    type="checkbox"
                    checked={machiningFeasible}
                    onChange={(e) => setMachiningFeasible(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>

              {/* Quality Standards */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-slate-900/1 dark:bg-slate-100/1">
                <span>NDT/Quality Audit Requirements Feasible? (Radiography, UT, Magnetic Particle testing)</span>
                <input
                  type="checkbox"
                  checked={qualityFeasible}
                  onChange={(e) => setQualityFeasible(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>

              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block pt-2">
                ESTIMATED PRODUCTION PARAMETERS
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Weight */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Est. Weight (KG) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full glass-input text-xs"
                    value={estWeight}
                    onChange={(e) => setEstWeight(Number(e.target.value))}
                  />
                </div>

                {/* Scrap */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Scrap Allowance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full glass-input text-xs"
                    value={estScrap}
                    onChange={(e) => setEstScrap(Number(e.target.value))}
                  />
                </div>

                {/* Cycle Time */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Cycle Time (Mins)</label>
                  <input
                    type="number"
                    className="w-full glass-input text-xs"
                    value={estCycleTime}
                    onChange={(e) => setEstCycleTime(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Technical Remarks */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Technical Audit Remarks *</label>
                <textarea
                  rows={2.5}
                  className="w-full glass-input text-xs"
                  placeholder="Detail draft shrinkage allowance, core box venting specifications..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Feasibility Verdict *</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as any)}
                  className="w-full glass-input text-xs font-semibold"
                >
                  <option value="Approved">Approved (Technically Feasible)</option>
                  <option value="Rejected">Rejected (Infeasible / Risk High)</option>
                  <option value="Revision Required">Revision Required (Check Drawing Details)</option>
                </select>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 mt-4">
              <button
                type="button"
                onClick={() => setSelectedTeId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEvaluation}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Submit Evaluation
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
