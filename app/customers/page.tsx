'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCRM } from '../../components/crm-provider';
import { useToast } from '../../components/toast-provider';
import { 
  Search, Plus, Filter, Download, ArrowUpDown, ChevronRight, X, Edit,
  TrendingUp, Activity, User, Phone, Mail, Globe, MapPin, Building,
  FileText, CalendarClock, ShoppingBag, Truck, ShieldAlert, CheckCircle,
  Archive, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { format } from 'date-fns';

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const { 
    customers, enquiries, quotations, orders, followUps, 
    dispatches, complaints, activities, updateCustomer, deleteCustomer 
  } = useCRM();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortField, setSortField] = useState('company_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [isEditing, setIsEditing] = useState(false);

  // Sync selected customer with URL search param
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedCustomerId(id);
    }
  }, [searchParams]);

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    // Update URL query param silently
    router.push(`/customers?id=${id}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    setSelectedCustomerId(null);
    router.push('/customers', { scroll: false });
  };

  // Convert Lead to Customer
  const handleConvertLead = async (id: string) => {
    try {
      await updateCustomer(id, { status: 'Active' });
      toast('Lead converted to Active Customer!', 'success');
    } catch (e: any) {
      toast(e.message || 'Conversion failed', 'error');
    }
  };

  // Archive Customer
  const handleArchiveCustomer = async (id: string) => {
    if (confirm('Are you sure you want to deactivate/archive this customer?')) {
      try {
        await updateCustomer(id, { status: 'Inactive' });
        toast('Customer archived successfully', 'info');
      } catch (e: any) {
        toast(e.message || 'Archiving failed', 'error');
      }
    }
  };

  // Filter and Sort Customers
  const filteredCustomers = customers
    .filter(c => {
      const matchSearch = c.company_name.toLowerCase().includes(search.toLowerCase()) ||
                          c.customer_code.toLowerCase().includes(search.toLowerCase()) ||
                          c.contact_person.toLowerCase().includes(search.toLowerCase()) ||
                          c.city.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a: any, b: any) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Customer ID,Company Name,Type,Industry,Contact Person,Designation,Phone,Email,City,State,Source,Status,Priority'];
    const rows = filteredCustomers.map(c => 
      `"${c.customer_code}","${c.company_name}","${c.customer_type}","${c.industry}","${c.contact_person}","${c.designation}","${c.mobile_number}","${c.email}","${c.city}","${c.state}","${c.source}","${c.status}","${c.priority}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Customers_Export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Customers CSV exported successfully', 'success');
  };

  // Get active selected customer details
  const customer = customers.find(c => c.id === selectedCustomerId);
  
  // Customer metrics/history
  const customerEnquiries = enquiries.filter(e => e.customer_id === selectedCustomerId);
  const customerQuotations = quotations.filter(q => q.customer_id === selectedCustomerId);
  const customerOrders = orders.filter(o => o.customer_id === selectedCustomerId);
  const customerDispatches = dispatches.filter(d => d.customer_id === selectedCustomerId);
  const customerComplaints = complaints.filter(c => c.customer_id === selectedCustomerId);
  const customerTimeline = activities.filter(a => a.customer_id === selectedCustomerId);

  const totalWonValue = customerOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] relative overflow-hidden">
      
      {/* Master List Section */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedCustomerId ? 'lg:w-[45%]' : 'w-full'}`}>
        
        {/* Search, Filter & Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto grow max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search company, code, contact..."
                className="w-full pl-10 pr-4 py-2 text-xs glass-input text-slate-800 dark:text-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl py-2 px-3 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Prospect">Prospect</option>
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Lost">Lost</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="p-2 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-400 hover:text-slate-650 transition-colors"
              title="Export CSV"
            >
              <Download className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Master Table Grid */}
        <div className="grow overflow-y-auto glass-card border border-slate-200/30 dark:border-slate-800/30">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 text-slate-500 uppercase border-b border-slate-200/30 dark:border-slate-800/30">
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-700" onClick={() => toggleSort('customer_code')}>
                  <span className="flex items-center gap-1">Code <ArrowUpDown className="w-3.5 h-3.5" /></span>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-700" onClick={() => toggleSort('company_name')}>
                  <span className="flex items-center gap-1">Company <ArrowUpDown className="w-3.5 h-3.5" /></span>
                </th>
                <th className="py-3 px-4 hidden sm:table-cell">Contact</th>
                <th className="py-3 px-4 hidden md:table-cell">City</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/20">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-450 font-medium">
                    No customers found matching filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => {
                  const isSelected = c.id === selectedCustomerId;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectCustomer(c.id)}
                      className={`hover:bg-slate-900/2 dark:hover:bg-slate-100/2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-500/5 dark:bg-blue-400/5 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-450 dark:text-slate-500">{c.customer_code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-slate-150">{c.company_name}</td>
                      <td className="py-3.5 px-4 hidden sm:table-cell text-slate-600 dark:text-slate-400 font-medium">
                        <div>{c.contact_person}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{c.designation}</div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-500 font-medium">{c.city}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          c.status === 'Active' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                          c.status === 'Lead' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                          c.status === 'Prospect' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-500'
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

      {/* Customer 360 Detail View Panel */}
      {customer && (
        <div className="w-full lg:w-[50%] h-full rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-2xl flex flex-col overflow-hidden z-25 absolute lg:relative inset-y-0 right-0">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between">
            <div className="grow overflow-hidden pr-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider">
                  {customer.customer_code}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  customer.priority === 'Critical' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                  customer.priority === 'High' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {customer.priority}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug truncate mt-0.5">
                {customer.company_name}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {customer.status === 'Lead' && (
                <button
                  onClick={() => handleConvertLead(customer.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-50 text-[10px] font-bold hover:opacity-90 transition-opacity"
                >
                  Convert Lead
                </button>
              )}
              {customer.status !== 'Inactive' && (
                <button
                  onClick={() => handleArchiveCustomer(customer.id)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-600"
                  title="Archive/Deactivate"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleCloseDetail}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Details Subheader Stats */}
          <div className="grid grid-cols-3 border-b border-slate-200/25 dark:border-slate-800/25 text-center text-xs py-3.5 bg-slate-900/1 dark:bg-slate-100/1 font-semibold text-slate-500">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-sans">Open Enquiries</span>
              <span className="text-sm font-bold text-slate-850 dark:text-slate-150 mt-0.5 block">
                {customerEnquiries.filter(e => !['Won', 'Lost', 'On Hold'].includes(e.status)).length}
              </span>
            </div>
            <div className="border-x border-slate-200/30 dark:border-slate-800/30">
              <span className="block text-[10px] text-slate-400 uppercase font-sans">Total Orders</span>
              <span className="text-sm font-bold text-slate-850 dark:text-slate-150 mt-0.5 block">
                {customerOrders.length}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-sans">Sales Value</span>
              <span className="text-sm font-bold text-emerald-500 mt-0.5 block">
                ₹{totalWonValue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200/30 dark:border-slate-800/30 overflow-x-auto text-xs font-bold text-slate-400 shrink-0">
            {['Overview', 'Enquiries', 'Quotations', 'Orders', 'Followups', 'Complaints', 'Timeline'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 border-b-2 hover:text-slate-700 dark:hover:text-slate-200 transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-500 font-bold' 
                    : 'border-transparent font-semibold'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="grow overflow-y-auto p-4 select-text">
            
            {/* Overview Tab */}
            {activeTab === 'Overview' && (
              <div className="space-y-4">
                
                {/* Contact information */}
                <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide border-b pb-2 mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" /> Primary Contact
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Contact Name:</span>
                      <span className="font-semibold text-slate-750 dark:text-slate-200">{customer.contact_person} ({customer.designation})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans">Mobile Number:</span>
                      <span className="font-semibold text-slate-750 dark:text-slate-200 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.mobile_number}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Email Address:</span>
                      <span className="font-semibold text-slate-750 dark:text-slate-200 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
                      </span>
                    </div>
                    {customer.website && (
                      <div>
                        <span className="text-slate-400 block">Website:</span>
                        <a href={customer.website} target="_blank" rel="noreferrer" className="text-blue-500 font-semibold flex items-center gap-1 hover:underline">
                          <Globe className="w-3.5 h-3.5" /> {customer.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide border-b pb-2 mb-3 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-slate-400" /> Company Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Industry Sectors:</span>
                      <span className="font-semibold text-slate-750 dark:text-slate-200">{customer.industry} ({customer.customer_type})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Source Channel:</span>
                      <span className="font-semibold text-slate-750 dark:text-slate-200">{customer.source}</span>
                    </div>
                    {customer.gst_number && (
                      <div>
                        <span className="text-slate-400 block">GSTIN:</span>
                        <span className="font-semibold text-slate-750 dark:text-slate-200 font-mono">{customer.gst_number}</span>
                      </div>
                    )}
                    {customer.pan_number && (
                      <div>
                        <span className="text-slate-400 block">PAN:</span>
                        <span className="font-semibold text-slate-750 dark:text-slate-200 font-mono">{customer.pan_number}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Address */}
                  <div className="mt-3 text-xs border-t border-slate-200/20 pt-3">
                    <span className="text-slate-400 block flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Billing/Shipping Address:
                    </span>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1 leading-normal">
                      {customer.address}, {customer.city}, {customer.state}, {customer.country} - {customer.pin_code}
                    </p>
                  </div>
                </div>

                {/* Remarks */}
                {customer.remarks && (
                  <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs">
                    <span className="text-slate-400 font-bold block mb-1">Administrative Remarks / Notes</span>
                    <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                      {customer.remarks}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Enquiries Tab */}
            {activeTab === 'Enquiries' && (
              <div className="space-y-3">
                {customerEnquiries.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-450">No enquiries submitted.</div>
                ) : (
                  customerEnquiries.map(enq => (
                    <div 
                      key={enq.id}
                      onClick={() => router.push(`/enquiries?id=${enq.id}`)}
                      className="p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-900/3 dark:hover:bg-slate-100/3 cursor-pointer transition-colors text-xs font-semibold"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{enq.enquiry_code}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                          ['Won', 'Quotation Sent'].includes(enq.status) ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                          enq.status === 'Lost' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                          'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        }`}>
                          {enq.status}
                        </span>
                      </div>
                      <p className="text-slate-450 dark:text-slate-500 line-clamp-2 leading-normal mt-1 font-medium">
                        {enq.requirement_description}
                      </p>
                      <div className="text-[10px] text-slate-400 font-sans mt-2">
                        Received: {format(new Date(enq.enquiry_date), 'dd MMM yyyy')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quotations Tab */}
            {activeTab === 'Quotations' && (
              <div className="space-y-3">
                {customerQuotations.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-450">No quotations generated.</div>
                ) : (
                  customerQuotations.map(q => (
                    <div 
                      key={q.id}
                      onClick={() => router.push(`/quotations?id=${q.id}`)}
                      className="p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-900/3 dark:hover:bg-slate-100/3 cursor-pointer transition-colors text-xs font-semibold"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-850 dark:text-slate-150">{q.quotation_code}</span>
                        <span className="text-slate-800 dark:text-slate-100 font-bold">₹{q.grand_total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-medium">
                        <span>Date: {format(new Date(q.quotation_date), 'dd MMM yyyy')}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          q.status === 'Accepted' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                          q.status === 'Rejected' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                          'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'Orders' && (
              <div className="space-y-3">
                {customerOrders.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-450">No orders placed.</div>
                ) : (
                  customerOrders.map(o => (
                    <div 
                      key={o.id}
                      onClick={() => router.push(`/orders?id=${o.id}`)}
                      className="p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-900/3 dark:hover:bg-slate-100/3 cursor-pointer transition-colors text-xs font-semibold"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{o.order_code}</span>
                          <span className="text-[10px] text-slate-400 block font-normal mt-0.5">PO: {o.po_number}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">₹{o.total_amount.toLocaleString()}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide mt-1 inline-block ${
                            o.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                            o.status === 'Partially Dispatched' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Followups Tab */}
            {activeTab === 'Followups' && (
              <div className="space-y-3">
                {followUps.filter(f => f.customer_id === selectedCustomerId).length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-450">No followups scheduled.</div>
                ) : (
                  followUps
                    .filter(f => f.customer_id === selectedCustomerId)
                    .map(fol => (
                      <div 
                        key={fol.id}
                        className="p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-xs font-semibold"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{fol.follow_up_code} &bull; {fol.follow_up_type}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            fol.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-blue-500/15 text-blue-600'
                          }`}>
                            {fol.status}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-normal mt-1">
                          {fol.discussion}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-2 font-normal">
                          Scheduled: {format(new Date(fol.follow_up_date), 'dd MMM yyyy hh:mm a')}
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* Complaints Tab */}
            {activeTab === 'Complaints' && (
              <div className="space-y-3">
                {customerComplaints.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-450">No complaints registered.</div>
                ) : (
                  customerComplaints.map(cmp => (
                    <div 
                      key={cmp.id}
                      onClick={() => router.push(`/complaints?id=${cmp.id}`)}
                      className="p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-900/3 dark:hover:bg-slate-100/3 cursor-pointer transition-colors text-xs font-semibold"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{cmp.complaint_code}</span>
                          <span className="text-[10px] text-rose-500 block font-bold mt-0.5">{cmp.complaint_type}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          cmp.status === 'Resolved' || cmp.status === 'Closed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                          'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}>
                          {cmp.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'Timeline' && (
              <div className="relative border-l border-slate-200/50 dark:border-slate-800/50 ml-2.5 pl-6 space-y-4 text-xs font-semibold">
                {customerTimeline.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-450 -ml-4">No activities logged yet.</div>
                ) : (
                  customerTimeline.map(act => (
                    <div key={act.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[30px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border border-white dark:border-slate-950" />
                      
                      <div className="text-[10px] text-slate-400 font-sans">
                        {format(new Date(act.created_at), 'dd MMM yyyy, hh:mm a')}
                      </div>
                      <p className="text-slate-850 dark:text-slate-200 font-bold mt-0.5 leading-normal">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium font-sans">
                        By: {act.user_name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
