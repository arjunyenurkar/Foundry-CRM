'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '../../components/crm-provider';
import { useTheme } from '../../components/theme-provider';
import { 
  Users, ClipboardList, FileText, ShoppingBag, 
  CalendarClock, AlertOctagon, TrendingUp, DollarSign,
  Filter, Calendar, ChevronRight, User, Briefcase, CheckSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

export default function Dashboard() {
  const router = useRouter();
  const { 
    customers, enquiries, quotations, orders, 
    followUps, complaints, activities, currentUser, users 
  } = useCRM();

  // Filters
  const [dateFilter, setDateFilter] = useState('All Time');
  const [salesFilter, setSalesFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter lists based on selections
  const getFilteredData = () => {
    // Current date threshold
    const baseDate = new Date();
    let startDate = new Date(baseDate.getFullYear(), 0, 1);

    if (dateFilter === 'Today') {
      startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    } else if (dateFilter === 'This Week') {
      startDate = new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === 'This Month') {
      startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    } else if (dateFilter === 'This Quarter') {
      const qMonth = Math.floor(baseDate.getMonth() / 3) * 3;
      startDate = new Date(baseDate.getFullYear(), qMonth, 1);
    } else if (dateFilter === 'This Year') {
      startDate = new Date(baseDate.getFullYear(), 0, 1);
    }

    const filterFn = (item: any) => {
      const itemDate = new Date(item.created_at || item.enquiry_date || item.quotation_date || item.order_date || item.complaint_date || item.follow_up_date);
      
      // Date constraint
      if (dateFilter !== 'All Time' && itemDate < startDate) return false;
      
      // Salesperson constraint
      if (salesFilter !== 'all' && (item.sales_person_id !== salesFilter && item.assigned_to !== salesFilter && item.sales_person !== salesFilter)) {
        if (item.sales_person_id !== salesFilter) return false;
      }

      // Customer constraint
      if (customerFilter !== 'all' && item.customer_id !== customerFilter && item.id !== customerFilter) return false;

      // Industry constraint
      if (industryFilter !== 'all') {
        const cust = customers.find(c => c.id === item.customer_id || c.id === item.id);
        if (!cust || cust.industry !== industryFilter) return false;
      }

      return true;
    };

    return {
      fCustomers: customers.filter(filterFn),
      fEnquiries: enquiries.filter(filterFn),
      fQuotations: quotations.filter(filterFn),
      fOrders: orders.filter(filterFn),
      fFollowUps: followUps.filter(filterFn),
      fComplaints: complaints.filter(filterFn)
    };
  };

  const { fCustomers, fEnquiries, fQuotations, fOrders, fFollowUps, fComplaints } = getFilteredData();

  // Statistics Calculations
  const activeLeadsCount = fCustomers.filter(c => c.status === 'Lead').length;
  const openEnquiriesCount = fEnquiries.filter(e => !['Won', 'Lost', 'On Hold'].includes(e.status)).length;
  const pendingQuotesCount = fQuotations.filter(q => !['Accepted', 'Rejected', 'Expired'].includes(q.status)).length;
  
  const pendingQuotesValue = fQuotations
    .filter(q => !['Accepted', 'Rejected', 'Expired'].includes(q.status))
    .reduce((sum, q) => sum + q.grand_total, 0);

  const totalOrdersValue = fOrders.reduce((sum, o) => sum + o.total_amount, 0);
  
  const pendingFollowupsCount = fFollowUps.filter(f => f.status === 'Scheduled').length;
  const openComplaintsCount = fComplaints.filter(c => !['Resolved', 'Closed'].includes(c.status)).length;

  // funnel stages
  const funnelData = [
    { name: 'Leads', count: customers.filter(c => c.status === 'Lead' || c.status === 'Prospect').length, value: 0 },
    { name: 'Enquiries', count: enquiries.length, value: 0 },
    { 
      name: 'Tech Approved', 
      count: enquiries.filter(e => ['Quotation Pending', 'Quotation Sent', 'Negotiation', 'Won'].includes(e.status)).length, 
      value: 0 
    },
    { name: 'Quotations', count: quotations.length, value: quotations.reduce((sum, q) => sum + q.grand_total, 0) },
    { 
      name: 'Negotiations', 
      count: quotations.filter(q => q.status === 'Negotiation' || q.status === 'Sent').length, 
      value: quotations.filter(q => q.status === 'Negotiation' || q.status === 'Sent').reduce((sum, q) => sum + q.grand_total, 0) 
    },
    { 
      name: 'Won / Orders', 
      count: orders.length, 
      value: totalOrdersValue 
    }
  ];

  // monthly values
  const monthlyData = [
    { month: 'Jan', Quotes: 800000, Orders: 600000 },
    { month: 'Feb', Quotes: 1200000, Orders: 900000 },
    { month: 'Mar', Quotes: 1500000, Orders: 1100000 },
    { month: 'Apr', Quotes: 2200000, Orders: 1600000 },
    { month: 'May', Quotes: 1800000, Orders: 1300050 },
    { month: 'Jun', Quotes: 3200000, Orders: 2200000 },
    { month: 'Jul', Quotes: 2800000, Orders: 1900000 },
    { month: 'Aug', Quotes: pendingQuotesValue, Orders: totalOrdersValue }
  ];

  const enquiryStatusCounts = enquiries.reduce((acc: any, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  const enquiryPieData = Object.keys(enquiryStatusCounts).map(key => ({
    name: key,
    value: enquiryStatusCounts[key]
  }));

  const COLORS = ['#60a5fa', '#34d399', '#f43f5e', '#fbbf24', '#a78bfa', '#f472b6', '#cbd5e1'];

  const todayStr = '2026-08-16';
  const urgentFollowups = followUps
    .filter(f => f.status === 'Scheduled')
    .sort((a, b) => new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime())
    .slice(0, 5);

  const recentQuotations = quotations.slice(0, 5);
  const recentComplaints = complaints.slice(0, 5);

  const industries = Array.from(new Set(customers.map(c => c.industry)));

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Logged in as <span className="text-slate-600 dark:text-slate-200">{currentUser.role}</span> &bull; Current Date: 16 Aug 2026
          </p>
        </div>
      </div>

      {/* Dynamic Filters Bar */}
      <div className="p-4 rounded-2xl glass-card flex flex-wrap items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-lg py-1 px-2.5 outline-none"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
        </div>

        {/* Salesperson Filter */}
        <div>
          <select 
            value={salesFilter} 
            onChange={(e) => setSalesFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-lg py-1 px-2.5 outline-none"
          >
            <option value="all">All Salespersons</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Customer Filter */}
        <div>
          <select 
            value={customerFilter} 
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-lg py-1 px-2.5 outline-none max-w-xs"
          >
            <option value="all">All Customers</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.company_name}</option>
            ))}
          </select>
        </div>

        {/* Industry Filter */}
        <div>
          <select 
            value={industryFilter} 
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-lg py-1 px-2.5 outline-none"
          >
            <option value="all">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">
              Customers
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {fCustomers.length}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Active: {fCustomers.filter(c => c.status === 'Active').length} &bull; Leads: {activeLeadsCount}
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
              Open Enquiries
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {openEnquiriesCount}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">
              In Feasibility: {fEnquiries.filter(e => e.status === 'Technical Evaluation').length}
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded-full font-sans">
              Pipeline Value
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 truncate block">
              ₹{(pendingQuotesValue / 100000).toFixed(2)}L
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Across {pendingQuotesCount} open quotation drafts
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
              Orders Value
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 truncate block">
              ₹{(totalOrdersValue / 100000).toFixed(2)}L
            </span>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Total sales from {fOrders.length} orders
            </p>
          </div>
        </div>

      </div>

      {/* Sub KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border glass-panel backdrop-blur-md flex items-center gap-3">
          <CalendarClock className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Scheduled Followups</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{pendingFollowupsCount}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border glass-panel backdrop-blur-md flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Open Complaints</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{openComplaintsCount}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border glass-panel backdrop-blur-md flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Quotation Win Rate</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {quotations.length > 0 ? `${Math.round((quotations.filter(q => q.status === 'Accepted').length / quotations.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>
        <div className="p-4 rounded-xl border glass-panel backdrop-blur-md flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-indigo-500 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Avg. Order Value</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              ₹{fOrders.length > 0 ? Math.round(totalOrdersValue / fOrders.length).toLocaleString() : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Funnel & Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Funnel */}
        <div className="p-5 rounded-2xl glass-card lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider mb-4">
              Sales Conversion Funnel
            </h3>
            
            <div className="flex flex-col gap-3">
              {funnelData.map((stage, idx) => {
                const maxCount = funnelData[0].count || 1;
                const pct = Math.round((stage.count / maxCount) * 100);
                
                return (
                  <div key={stage.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{stage.name}</span>
                      <span className="text-slate-400">
                        {stage.count} {stage.count === 1 ? 'record' : 'records'} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                        style={{ width: `${Math.max(3, pct)}%` }}
                      />
                    </div>
                    {stage.value > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium block text-right -mt-0.5">
                        Est: ₹{stage.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="p-5 rounded-2xl glass-card lg:col-span-2 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider mb-4">
              Monthly Trend: Quotations vs Confirmed Orders
            </h3>
          </div>
          <div className="w-full grow h-[250px]">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip 
                    formatter={(val: any) => [`₹${val.toLocaleString()}`, '']}
                    contentStyle={{ borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="Quotes" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Quotations (Draft/Sent)" />
                  <Line type="monotone" dataKey="Orders" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Confirmed Sales Orders" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading graph...</div>
            )}
          </div>
        </div>

      </div>

      {/* Pie Chart & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Split */}
        <div className="p-5 rounded-2xl glass-card lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider mb-4">
              Enquiry Status Split
            </h3>
          </div>
          <div className="w-full h-[200px] relative flex justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enquiryPieData.length > 0 ? enquiryPieData : [{ name: 'None', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {enquiryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading graph...</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-semibold text-slate-500">
            {enquiryPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda list */}
        <div className="p-5 rounded-2xl glass-card lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-200/40 dark:border-slate-800/40">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider">
                Immediate Follow-up Agenda
              </h3>
              <button 
                onClick={() => router.push('/followups')}
                className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:underline"
              >
                Calendar View <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px]">
              {urgentFollowups.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  No upcoming followups scheduled. Great work!
                </div>
              ) : (
                urgentFollowups.map(fol => {
                  const cust = customers.find(c => c.id === fol.customer_id);
                  const isOverdue = new Date(fol.follow_up_date) < new Date(todayStr);

                  return (
                    <div 
                      key={fol.id} 
                      onClick={() => router.push(`/followups?id=${fol.id}`)}
                      className="p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 flex items-center justify-between cursor-pointer hover:bg-slate-900/3 dark:hover:bg-slate-100/3 transition-colors text-xs font-semibold"
                    >
                      <div className="grow overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {cust ? cust.company_name : 'Customer'}
                          </span>
                          {isOverdue && (
                            <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide shrink-0">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{fol.discussion}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">
                          {new Date(fol.follow_up_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase block tracking-wider">
                          {fol.follow_up_type}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Enquiries, Quotations & Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Quotations */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-200/40 dark:border-slate-800/40">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider">
                Recent Quotations
              </h3>
              <button onClick={() => router.push('/quotations')} className="text-xs text-slate-450 hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-2.5">
              {recentQuotations.map(q => {
                const cust = customers.find(c => c.id === q.customer_id);
                return (
                  <div key={q.id} className="flex justify-between text-xs font-semibold">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[150px]">
                        {cust?.company_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{q.quotation_code}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-700 dark:text-slate-300 block font-bold">₹{q.grand_total.toLocaleString()}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide inline-block mt-0.5 ${
                        q.status === 'Accepted' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                        q.status === 'Rejected' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                        'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-200/40 dark:border-slate-800/40">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider">
                Recent Enquiries
              </h3>
              <button onClick={() => router.push('/enquiries')} className="text-xs text-slate-450 hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-2.5">
              {enquiries.slice(0, 5).map(e => {
                const cust = customers.find(c => c.id === e.customer_id);
                return (
                  <div key={e.id} className="flex justify-between text-xs font-semibold">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[150px]">
                        {cust?.company_name}
                      </span>
                      <span className="text-[10px] text-slate-450 block truncate max-w-[150px] mt-0.5 font-medium">{e.requirement_description}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-sans block">{e.enquiry_code}</span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide inline-block mt-0.5">
                        {e.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Complaints */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-200/40 dark:border-slate-800/40">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider">
                Recent Customer Complaints
              </h3>
              <button onClick={() => router.push('/complaints')} className="text-xs text-slate-450 hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-2.5">
              {recentComplaints.map(c => {
                const cust = customers.find(cu => cu.id === c.customer_id);
                return (
                  <div key={c.id} className="flex justify-between text-xs font-semibold">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[150px]">
                        {cust?.company_name}
                      </span>
                      <span className="text-[10px] text-rose-500 font-bold block mt-0.5">{c.complaint_type}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide inline-block ${
                        c.severity === 'Critical' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' :
                        c.severity === 'High' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' :
                        'bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-350'
                      }`}>
                        {c.severity}
                      </span>
                      <span className="text-[10px] text-slate-450 font-sans block mt-0.5">{c.complaint_code}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
