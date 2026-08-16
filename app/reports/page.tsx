'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '../../components/crm-provider';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import { 
  TrendingUp, DollarSign, Percent, AlertCircle, 
  Download, Calendar, BarChart3, Users, Factory, CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { customers, enquiries, quotations, orders, complaints, items: itemMaster, orderItems } = useCRM();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Calculations
  const totalLeads = customers.filter(c => c.status === 'Lead' || c.status === 'Prospect').length || 1;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  
  const leadConversionRate = Math.round((activeCustomers / (totalLeads + activeCustomers)) * 100);

  const totalQuotes = quotations.length || 1;
  const acceptedQuotes = quotations.filter(q => q.status === 'Accepted').length;
  const quoteConversionRate = Math.round((acceptedQuotes / totalQuotes) * 100);

  const totalOrdersValue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalOrdersValue / orders.length) : 0;

  const totalQuotesValue = quotations.reduce((sum, q) => sum + q.grand_total, 0);
  const avgQuoteValue = quotations.length > 0 ? Math.round(totalQuotesValue / quotations.length) : 0;

  // Pipeline stages value
  const pipelineOpenValue = quotations
    .filter(q => ['Draft', 'Under Approval', 'Approved', 'Sent', 'Negotiation'].includes(q.status))
    .reduce((sum, q) => sum + q.grand_total, 0);
    
  const pipelineWonValue = totalOrdersValue;
  
  const pipelineLostValue = quotations
    .filter(q => q.status === 'Rejected')
    .reduce((sum, q) => sum + q.grand_total, 0);

  // 2. Customer-wise Sales Report Data
  const customerSales = customers.map(c => {
    const custOrders = orders.filter(o => o.customer_id === c.id);
    const amount = custOrders.reduce((sum, o) => sum + o.total_amount, 0);
    return {
      name: c.company_name,
      code: c.customer_code,
      ordersCount: custOrders.length,
      amount
    };
  }).filter(c => c.ordersCount > 0).sort((a, b) => b.amount - a.amount);

  // 3. Item-wise Sales Report Data
  const itemSales = itemMaster.map(item => {
    const matchingOrderItems = orderItems.filter(oi => oi.item_id === item.id);
    const qty = matchingOrderItems.reduce((sum, oi) => sum + oi.quantity, 0);
    const amount = matchingOrderItems.reduce((sum, oi) => sum + oi.amount, 0);
    return {
      code: item.item_code,
      name: item.item_name,
      material: item.material_grade,
      qty,
      amount
    };
  }).filter(i => i.qty > 0).sort((a, b) => b.amount - a.amount);

  // Monthly Sales trend for Recharts
  const trendData = [
    { month: 'Jan', Sales: 800000, Quotes: 1200000 },
    { month: 'Feb', Sales: 1400000, Quotes: 2100000 },
    { month: 'Mar', Sales: 1200000, Quotes: 1800000 },
    { month: 'Apr', Sales: 2200000, Quotes: 3400000 },
    { month: 'May', Sales: 1900000, Quotes: 2800000 },
    { month: 'Jun', Sales: 3100000, Quotes: 4200000 },
    { month: 'Jul', Sales: 2800000, Quotes: 3900000 },
    { month: 'Aug', Sales: totalOrdersValue, Quotes: totalQuotesValue }
  ];

  const handleExportTable = (type: string) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (type === 'customer') {
      csvContent += "Customer ID,Company Name,Orders Count,Total Sales (INR)\n";
      customerSales.forEach(c => {
        csvContent += `"${c.code}","${c.name}",${c.ordersCount},${c.amount}\n`;
      });
    } else if (type === 'item') {
      csvContent += "Item Code,Item Name,Material,Quantity Sold,Total Revenue (INR)\n";
      itemSales.forEach(i => {
        csvContent += `"${i.code}","${i.name}","${i.material}",${i.qty},${i.amount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sales_Report_${type}_wise_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-sans">Executive Reports Portal</p>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Sales & Performance Analytics</h1>
        </div>
      </div>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Lead Conversion */}
        <div className="p-5 rounded-2xl glass-card">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase block tracking-wider">Lead Conversion Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{leadConversionRate}%</span>
            <Percent className="w-4 h-4 text-blue-500 shrink-0" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal">
            Ratio of Prospect/Lead accounts successfully active
          </p>
        </div>

        {/* Quotation Win Rate */}
        <div className="p-5 rounded-2xl glass-card">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase block tracking-wider">Quotation Win Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{quoteConversionRate}%</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal">
            Percentage of commercial quotation drafts accepted
          </p>
        </div>

        {/* Avg order value */}
        <div className="p-5 rounded-2xl glass-card">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase block tracking-wider">Average Order Value</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">₹{avgOrderValue.toLocaleString()}</span>
            <DollarSign className="w-4 h-4 text-indigo-500 shrink-0" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal">
            Mean booking value across all purchase orders
          </p>
        </div>

        {/* Complaint Rate */}
        <div className="p-5 rounded-2xl glass-card">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase block tracking-wider">Complaint Resolution Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {complaints.length > 0 ? `${Math.round((complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length / complaints.length) * 100)}%` : '100%'}
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal">
            Quality complaint tickets closed with CAPA log
          </p>
        </div>

      </div>

      {/* Pipeline Valuation Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
        <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-blue-600 flex justify-between items-center">
          <div>
            <span className="text-slate-400 uppercase text-[8px] tracking-wider block">Open Pipeline Value</span>
            <span className="text-sm font-bold block mt-0.5">₹{pipelineOpenValue.toLocaleString()}</span>
          </div>
          <BarChart3 className="w-6 h-6 opacity-40" />
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-600 flex justify-between items-center">
          <div>
            <span className="text-slate-400 uppercase text-[8px] tracking-wider block">Won Revenue Value</span>
            <span className="text-sm font-bold block mt-0.5">₹{pipelineWonValue.toLocaleString()}</span>
          </div>
          <CheckSquare className="w-6 h-6 opacity-40" />
        </div>

        <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-600 flex justify-between items-center">
          <div>
            <span className="text-slate-400 uppercase text-[8px] tracking-wider block">Lost Opportunity Value</span>
            <span className="text-sm font-bold block mt-0.5">₹{pipelineLostValue.toLocaleString()}</span>
          </div>
          <AlertCircle className="w-6 h-6 opacity-40" />
        </div>
      </div>

      {/* Monthly Sales Revenue Chart */}
      <div className="p-5 rounded-2xl glass-card flex flex-col justify-between min-h-[300px]">
        <div>
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider mb-4">
            Cumulative Revenue & Lead Offer Trends
          </h3>
        </div>
        <div className="w-full grow h-[250px]">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip 
                  formatter={(val: any) => [`₹${val.toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="Quotes" stroke="#60a5fa" fillOpacity={0.15} fill="url(#colorQuotes)" strokeWidth={3} name="Total Quoted Offers" />
                <Area type="monotone" dataKey="Sales" stroke="#10b981" fillOpacity={0.15} fill="url(#colorSales)" strokeWidth={3} name="Booked Sales Revenue" />
                
                {/* Custom Gradient Definitions */}
                <defs>
                  <linearGradient id="colorQuotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading graph...</div>
          )}
        </div>
      </div>

      {/* Customer-wise and Item-wise report listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer wise sales */}
        <div className="glass-card flex flex-col justify-between">
          <div className="p-4 border-b border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-450" /> Customer Sales Report
            </h3>
            <button 
              onClick={() => handleExportTable('customer')}
              className="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-0.5 hover:underline"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-[250px] grow">
            <table className="w-full border-collapse text-left text-xs font-semibold">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 text-slate-500 uppercase border-b border-slate-200/30 dark:border-slate-800/30">
                <tr>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4 text-center">Orders</th>
                  <th className="py-2.5 px-4 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/20 text-slate-650 dark:text-slate-350">
                {customerSales.map(c => (
                  <tr key={c.code} className="hover:bg-slate-900/1 dark:hover:bg-slate-100/1">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">{c.ordersCount}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-850 dark:text-slate-150">₹{c.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Item-wise sales */}
        <div className="glass-card flex flex-col justify-between">
          <div className="p-4 border-b border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider flex items-center gap-1.5">
              <Factory className="w-4 h-4 text-slate-450" /> Casting Product Sales
            </h3>
            <button 
              onClick={() => handleExportTable('item')}
              className="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-0.5 hover:underline"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-[250px] grow">
            <table className="w-full border-collapse text-left text-xs font-semibold">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 text-slate-500 uppercase border-b border-slate-200/30 dark:border-slate-800/30">
                <tr>
                  <th className="py-2.5 px-4">Item Name</th>
                  <th className="py-2.5 px-4 text-center">Qty Sold</th>
                  <th className="py-2.5 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/20 text-slate-650 dark:text-slate-350">
                {itemSales.map(i => (
                  <tr key={i.code} className="hover:bg-slate-900/1 dark:hover:bg-slate-100/1">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {i.name}
                      <span className="text-[10px] text-slate-450 block font-normal mt-0.5">Grade: {i.material}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">{i.qty} Pcs</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-850 dark:text-slate-150">₹{i.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
