'use client';

import React, { useState } from 'react';
import { useCRM } from '../../components/crm-provider';
import { Search, Filter, HardDrive, FileSpreadsheet, Plus, Download } from 'lucide-react';

export default function ItemsPage() {
  const { items, customers } = useCRM();
  
  const [search, setSearch] = useState('');
  const [processFilter, setProcessFilter] = useState('all');
  const [patternFilter, setPatternFilter] = useState('all');

  const filteredItems = items.filter(item => {
    const cust = customers.find(c => c.id === item.customer_id);
    const matchSearch = item.item_name.toLowerCase().includes(search.toLowerCase()) ||
                        item.item_code.toLowerCase().includes(search.toLowerCase()) ||
                        item.drawing_number.toLowerCase().includes(search.toLowerCase()) ||
                        (cust && cust.company_name.toLowerCase().includes(search.toLowerCase()));

    const matchProcess = processFilter === 'all' || item.process === processFilter;
    const matchPattern = patternFilter === 'all' || item.pattern_status === patternFilter;

    return matchSearch && matchProcess && matchPattern;
  });

  const handleExportCSV = () => {
    const headers = ['Item Code,Item Name,Customer,Drawing Number,Revision,Material Grade,Casting Process,Weight (KG),Pattern Status,Machining Status'];
    const rows = filteredItems.map(item => {
      const cust = customers.find(c => c.id === item.customer_id);
      return `"${item.item_code}","${item.item_name}","${cust ? cust.company_name : ''}","${item.drawing_number}","${item.drawing_revision}","${item.material_grade}","${item.process}",${item.weight},"${item.pattern_status}","${item.machining_status}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Item_Master_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Production Specification Master</p>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Casting Item Master</h1>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search items, drawing number..."
            className="w-full pl-9 pr-4 py-2 text-xs glass-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            value={processFilter}
            onChange={(e) => setProcessFilter(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl py-2 px-3 outline-none"
          >
            <option value="all">All Molding Processes</option>
            <option value="Sand Casting">Sand Casting</option>
            <option value="Shell Moulding">Shell Moulding</option>
            <option value="Investment Casting">Investment Casting</option>
            <option value="HPDC">High Pressure Die Casting</option>
          </select>
        </div>

        <div>
          <select
            value={patternFilter}
            onChange={(e) => setPatternFilter(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl py-2 px-3 outline-none"
          >
            <option value="all">All Pattern Statuses</option>
            <option value="Available">Available</option>
            <option value="Required">Required</option>
            <option value="Under Development">Under Development</option>
          </select>
        </div>
      </div>

      {/* Item Master Grid */}
      <div className="glass-card overflow-hidden">
        <table className="w-full border-collapse text-left text-xs font-semibold">
          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 uppercase border-b border-slate-200/30 dark:border-slate-800/30">
            <tr>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-4">Linked Customer</th>
              <th className="py-3 px-4">Drawing Number</th>
              <th className="py-3 px-4">Material Grade</th>
              <th className="py-3 px-4">Process</th>
              <th className="py-3 px-4">Weight (KG)</th>
              <th className="py-3 px-4">Pattern status</th>
              <th className="py-3 px-4">Machining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/20">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-450 font-medium">
                  No casting items registered matching search parameters.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const cust = customers.find(c => c.id === item.customer_id);
                return (
                  <tr key={item.id} className="hover:bg-slate-900/2 dark:hover:bg-slate-100/2 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-450 dark:text-slate-500">{item.item_code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-slate-150">{item.item_name}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-450">{cust ? cust.company_name : 'N/A'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {item.drawing_number} <span className="text-[10px] text-slate-400 font-sans font-normal">({item.drawing_revision})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-650 dark:text-slate-350">{item.material_grade}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{item.process}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">{item.weight} KG</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.pattern_status === 'Available' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                        item.pattern_status === 'Required' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                        'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}>
                        {item.pattern_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-500">{item.machining_status}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
