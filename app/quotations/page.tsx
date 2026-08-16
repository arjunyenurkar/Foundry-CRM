'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCRM } from '../../components/crm-provider';
import { useToast } from '../../components/toast-provider';
import { 
  Search, ChevronRight, X, Printer, Download, Send, CheckSquare, 
  ShoppingBag, Ban, FileText, FileCheck, Eye, ClipboardCheck
} from 'lucide-react';
import { format } from 'date-fns';

export default function QuotationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const { 
    quotations, customers, quotationItems, items: itemMaster, 
    updateQuotation, approveQuotation, convertQuotationToOrder, 
    currentUser, hasPermission, enquiries, enquiryItems 
  } = useCRM();

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Details' | 'PDF'>('Details');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Approval modal state
  const [approveOpen, setApproveOpen] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  // Order conversion helper
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedQuoteId(id);
    }
  }, [searchParams]);

  const handleSelectQuote = (id: string) => {
    setSelectedQuoteId(id);
    router.push(`/quotations?id=${id}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    setSelectedQuoteId(null);
    router.push('/quotations', { scroll: false });
  };

  const handleSendQuote = async (id: string) => {
    try {
      await updateQuotation(id, { status: 'Sent' });
      toast('Quotation sent to customer successfully!', 'success');
    } catch (e: any) {
      toast('Failed to send quotation', 'error');
    }
  };

  const handleRejectQuote = async (id: string) => {
    if (confirm('Are you sure you want to reject this quotation?')) {
      try {
        await updateQuotation(id, { status: 'Rejected' });
        toast('Quotation rejected', 'info');
      } catch (e: any) {
        toast('Failed to reject quotation', 'error');
      }
    }
  };

  const submitApproval = async () => {
    if (!selectedQuoteId) return;
    try {
      await approveQuotation(selectedQuoteId, approvalRemarks);
      toast('Quotation approved successfully!', 'success');
      setApproveOpen(false);
      setApprovalRemarks('');
    } catch (e: any) {
      toast('Approval failed', 'error');
    }
  };

  const submitOrderConversion = async () => {
    if (!selectedQuoteId) return;
    if (!poNumber) {
      toast('Please enter the customer PO number.', 'warning');
      return;
    }
    try {
      await convertQuotationToOrder(
        selectedQuoteId,
        poNumber,
        new Date(poDate).toISOString(),
        new Date(deliveryDate).toISOString(),
        'Converted to Sales Order from Accepted Quotation.'
      );
      toast(`Sales Order registered successfully!`, 'success');
      setOrderModalOpen(false);
      setPoNumber('');
      router.push('/orders');
    } catch (e: any) {
      toast(e.message || 'Conversion failed', 'error');
    }
  };

  // Filter list
  const filteredQuotes = quotations.filter(q => {
    const cust = customers.find(c => c.id === q.customer_id);
    const matchSearch = q.quotation_code.toLowerCase().includes(search.toLowerCase()) ||
                        (cust && cust.company_name.toLowerCase().includes(search.toLowerCase()));
    
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const quote = quotations.find(q => q.id === selectedQuoteId);
  const customer = quote ? customers.find(c => c.id === quote.customer_id) : null;
  const quoteItems = quote ? quotationItems.filter(qi => qi.quotation_id === quote.id) : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] relative overflow-hidden">
      
      {/* Master List */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedQuoteId ? 'lg:w-[45%]' : 'w-full'}`}>
        
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search quotations, customer..."
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
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Under Approval">Under Approval</option>
              <option value="Approved">Approved</option>
              <option value="Sent">Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="grow overflow-y-auto glass-card">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 text-slate-500 uppercase border-b border-slate-200/30 dark:border-slate-800/30">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 hidden sm:table-cell">Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/20">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-450 font-medium">
                    No quotations drafted yet.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map(q => {
                  const cust = customers.find(c => c.id === q.customer_id);
                  const isSelected = q.id === selectedQuoteId;
                  return (
                    <tr
                      key={q.id}
                      onClick={() => handleSelectQuote(q.id)}
                      className={`hover:bg-slate-900/2 dark:hover:bg-slate-100/2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-500/5 dark:bg-blue-400/5 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-450 dark:text-slate-500">{q.quotation_code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-slate-150">{cust ? cust.company_name : 'Unknown Customer'}</td>
                      <td className="py-3.5 px-4 hidden sm:table-cell text-slate-500 font-medium">
                        {format(new Date(q.quotation_date), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">₹{q.grand_total.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          q.status === 'Accepted' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                          q.status === 'Rejected' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                          q.status === 'Sent' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                          q.status === 'Approved' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {q.status}
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

      {/* Quotation Detail View Panel */}
      {quote && customer && (
        <div className="w-full lg:w-[50%] h-full rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-2xl flex flex-col overflow-hidden z-25 absolute lg:relative inset-y-0 right-0">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between">
            <div className="grow overflow-hidden pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {quote.quotation_code} &bull; Valid till: {format(new Date(quote.valid_until), 'dd MMM yyyy')}
              </span>
              <h2 className="text-base font-bold text-slate-850 dark:text-slate-150 truncate mt-0.5 leading-snug">
                {customer.company_name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              
              {/* Approval controls */}
              {hasPermission('approve', 'quotations') && ['Draft', 'Under Approval'].includes(quote.status) && (
                <button
                  onClick={() => setApproveOpen(true)}
                  className="flex items-center gap-1 bg-indigo-500 hover:opacity-95 text-slate-50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                >
                  <FileCheck className="w-3.5 h-3.5" /> Approve
                </button>
              )}

              {/* Send control */}
              {quote.status === 'Approved' && (
                <button
                  onClick={() => handleSendQuote(quote.id)}
                  className="flex items-center gap-1 bg-blue-500 hover:opacity-95 text-slate-50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                >
                  <Send className="w-3.5 h-3.5" /> Send Quote
                </button>
              )}

              {/* Convert Order control */}
              {['Sent', 'Negotiation', 'Approved'].includes(quote.status) && (
                <button
                  onClick={() => setOrderModalOpen(true)}
                  className="flex items-center gap-1 bg-emerald-500 hover:opacity-95 text-slate-50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Convert to Order
                </button>
              )}

              {/* Close */}
              <button
                onClick={handleCloseDetail}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-650"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200/30 dark:border-slate-800/30 text-xs font-bold text-slate-400 shrink-0">
            <button
              onClick={() => setActiveTab('Details')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'Details' ? 'border-blue-500 text-blue-500' : 'border-transparent'
              }`}
            >
              Specifications & Terms
            </button>
            <button
              onClick={() => setActiveTab('PDF')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'PDF' ? 'border-blue-500 text-blue-500' : 'border-transparent'
              }`}
            >
              PDF Printable Document
            </button>
          </div>

          {/* Detail Tab Contents */}
          <div className="grow overflow-y-auto p-4 select-text">
            
            {activeTab === 'Details' ? (
              <div className="space-y-4">
                
                {/* Meta details */}
                <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide border-b pb-2 mb-3">
                    Commercial Terms
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-slate-500 font-semibold">
                    <div><span className="text-slate-400 block font-normal">Payment Terms:</span> {quote.payment_terms}</div>
                    <div><span className="text-slate-400 block font-normal">Delivery Terms:</span> {quote.delivery_terms}</div>
                    <div><span className="text-slate-400 block font-normal">Price Basis:</span> {quote.price_basis}</div>
                    <div><span className="text-slate-400 block font-normal">Valid Until:</span> {format(new Date(quote.valid_until), 'dd MMM yyyy')}</div>
                  </div>
                  {quote.approved_by && (
                    <div className="mt-3.5 border-t border-slate-200/20 pt-3 flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg text-emerald-600">
                      <ClipboardCheck className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold block">Quotation Approved</span>
                        {quote.approval_remarks && <p className="text-[10px] mt-0.5">{quote.approval_remarks}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items pricing table */}
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-3">
                    Items Price Matrix
                  </span>
                  
                  <div className="flex flex-col gap-3">
                    {quoteItems.map((qi, idx) => {
                      const itemObj = itemMaster.find(it => it.id === qi.item_id);
                      const enqItem = enquiryItems.find(ei => ei.id === qi.enquiry_item_id);
                      const qty = enqItem ? enqItem.quantity : 1;

                      return (
                        <div key={qi.id} className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs">
                          <div className="flex justify-between items-start border-b border-slate-200/15 pb-2 mb-2">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">
                                {idx + 1}. {itemObj?.item_name}
                              </span>
                              <span className="text-[10px] text-slate-450 block font-mono mt-0.5">Dwg: {itemObj?.drawing_number}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold block">₹{qi.amount.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 block font-normal font-sans">Rate: ₹{qi.rate} &bull; Qty: {qty} Pcs</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-slate-500 font-semibold mt-1">
                            <div><span className="text-slate-400 block font-normal">Discount:</span> {qi.discount_percent}% (₹{qi.discount_amount})</div>
                            <div><span className="text-slate-400 block font-normal">Tax (GST):</span> {qi.tax_percent}% (₹{qi.tax_amount})</div>
                            <div><span className="text-slate-400 block font-normal">Delivery:</span> {qi.delivery_period_weeks} Weeks</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final totals block */}
                <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 glass-panel flex flex-col gap-1.5 w-72 ml-auto text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-slate-800 dark:text-slate-200">₹{quote.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>Discount:</span>
                    <span>- ₹{quote.discount_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-500">
                    <span>Tax (GST):</span>
                    <span>+ ₹{quote.tax_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-50 border-t border-slate-200/40 dark:border-slate-800/40 pt-1.5 mt-1">
                    <span>Grand Total:</span>
                    <span>₹{quote.grand_total.toLocaleString()}</span>
                  </div>
                </div>

              </div>
            ) : (
              // PDF PREVIEW LAYOUT (Printable invoice stylesheet style)
              <div id="quotation-pdf" className="p-8 bg-white border border-slate-200 text-slate-900 rounded-xl space-y-6 flex flex-col shadow-inner select-text">
                
                {/* Print button bar (visible only in app preview, hidden during print) */}
                <div className="flex justify-end gap-2 border-b pb-4 border-slate-200 print:hidden -mt-4 -mx-4 px-4 bg-slate-50 py-2 rounded-t-xl">
                  <button onClick={handlePrint} className="p-2 border rounded-lg hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 text-xs font-bold">
                    <Printer className="w-4.5 h-4.5" /> Print
                  </button>
                  <button onClick={handlePrint} className="p-2 border rounded-lg hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 text-xs font-bold">
                    <Download className="w-4.5 h-4.5" /> Download PDF
                  </button>
                </div>

                {/* PDF Content */}
                <div className="flex justify-between items-start border-b pb-5 border-slate-200">
                  <div>
                    <div className="font-bold text-lg tracking-tight uppercase flex items-center gap-1 text-slate-950">
                      TRUFORM TECHNO PRODUCTS PVT. LTD.
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold tracking-wide block uppercase mt-0.5">Pipes & Casting Division</span>
                    <p className="text-[10px] text-slate-500 leading-normal max-w-xs mt-2 font-medium">
                      Plot No. 12, Sector-A, Nagpur Industrial Area, Nagpur, Maharashtra - 440008<br />
                      GSTIN: 27NAGPR4455C1Z1 | email: sales@truformindia.com
                    </p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-xl font-bold tracking-tight uppercase text-slate-900">QUOTATION</h1>
                    <table className="text-[10px] font-semibold text-left ml-auto mt-3 border-collapse">
                      <tbody>
                        <tr>
                          <td className="pr-4 py-1 text-slate-500">Quote No:</td>
                          <td className="font-bold">{quote.quotation_code}</td>
                        </tr>
                        <tr>
                          <td className="pr-4 py-1 text-slate-500">Date:</td>
                          <td>{format(new Date(quote.quotation_date), 'dd MMM yyyy')}</td>
                        </tr>
                        <tr>
                          <td className="pr-4 py-1 text-slate-500">Valid Until:</td>
                          <td>{format(new Date(quote.valid_until), 'dd MMM yyyy')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 text-[10px] font-semibold">
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] tracking-wider mb-1">QUOTED TO:</span>
                    <span className="font-bold text-slate-950 block text-xs">{customer.company_name}</span>
                    <p className="text-slate-500 mt-1 leading-normal max-w-xs font-medium">
                      {customer.address}, {customer.city}, {customer.state} - {customer.pin_code}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] tracking-wider mb-1">CONTACT REPRESENTATIVE:</span>
                    <span className="font-bold text-slate-800 block">{customer.contact_person}</span>
                    <span className="text-slate-500 block mt-0.5 font-medium">{customer.designation}</span>
                    <span className="text-slate-500 block font-medium">Email: {customer.email}</span>
                  </div>
                </div>

                {/* PDF Items Table */}
                <table className="w-full text-left text-[10px] font-semibold border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 uppercase text-[8px] tracking-wider border-b border-slate-300">
                      <th className="py-2.5 px-3">SNo</th>
                      <th className="py-2.5 px-3">Casting Item / Dwg</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Disc %</th>
                      <th className="py-2.5 px-3 text-right">Tax (GST)</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {quoteItems.map((qi, idx) => {
                      const itemObj = itemMaster.find(it => it.id === qi.item_id);
                      const enqItem = enquiryItems.find(ei => ei.id === qi.enquiry_item_id);
                      const qty = enqItem ? enqItem.quantity : 1;

                      return (
                        <tr key={qi.id}>
                          <td className="py-3 px-3 text-slate-450">{idx + 1}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {itemObj?.item_name}
                            <span className="font-mono font-normal text-[9px] text-slate-450 block mt-0.5">Dwg: {itemObj?.drawing_number}</span>
                          </td>
                          <td className="py-3 px-3 text-right">{qty}</td>
                          <td className="py-3 px-3 text-right">₹{qi.rate}</td>
                          <td className="py-3 px-3 text-right text-rose-500">{qi.discount_percent}%</td>
                          <td className="py-3 px-3 text-right text-blue-500">{qi.tax_percent}%</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-950">₹{qi.amount.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Totals Summary */}
                <div className="flex justify-between items-start pt-4 border-t border-slate-200">
                  <div className="text-[10px] text-slate-500 max-w-xs space-y-1.5 font-medium leading-relaxed">
                    <span className="font-bold text-slate-700 block uppercase text-[8px] tracking-wider">NOTES & CONDITIONS:</span>
                    <p>1. Delivery terms: {quote.delivery_terms}.</p>
                    <p>2. Payment terms: {quote.payment_terms}.</p>
                    <p>3. Patterns must be approved by technical design team before mold release.</p>
                  </div>
                  <table className="text-[10px] font-semibold text-left ml-auto w-64 border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-1 text-slate-500">Subtotal:</td>
                        <td className="text-right py-1">₹{quote.subtotal.toLocaleString()}</td>
                      </tr>
                      <tr className="text-rose-500">
                        <td className="py-1">Discount:</td>
                        <td className="text-right py-1">- ₹{quote.discount_amount.toLocaleString()}</td>
                      </tr>
                      <tr className="text-blue-500">
                        <td className="py-1">Tax Amount (GST 18%):</td>
                        <td className="text-right py-1">+ ₹{quote.tax_amount.toLocaleString()}</td>
                      </tr>
                      <tr className="border-t border-slate-400 text-sm font-bold text-slate-950">
                        <td className="py-2.5">Grand Total:</td>
                        <td className="text-right py-2.5">₹{quote.grand_total.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signatory line */}
                <div className="flex justify-between pt-10 text-[9px] font-bold text-slate-450 uppercase text-center">
                  <div>
                    <div className="h-10 border-b border-dashed border-slate-300 w-40 mb-1" />
                    <span>Customer Acceptance</span>
                  </div>
                  <div>
                    <div className="h-10 border-b border-dashed border-slate-300 w-40 mb-1" />
                    <span>Authorized Signatory</span>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* Approval modal */}
      {approveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border glass-panel p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider border-b pb-2">
              Approve Commercial Offer
            </h3>
            
            <div className="text-xs font-semibold space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Approval Remarks</label>
                <textarea
                  rows={2}
                  className="w-full glass-input text-xs"
                  placeholder="Approved under special margin guidelines, patterns feasible..."
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t pt-3">
              <button
                onClick={() => setApproveOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitApproval}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:opacity-95 text-slate-50 text-xs font-bold"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Conversion Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border glass-panel p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider border-b pb-2">
              Confirm Purchase Order Confirmation
            </h3>
            
            <div className="text-xs font-semibold space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Customer PO Number *</label>
                <input
                  type="text"
                  className="w-full glass-input text-xs"
                  placeholder="e.g. PO-88902-IND"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">PO Date *</label>
                  <input
                    type="date"
                    className="w-full glass-input text-xs"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Expected Delivery Date</label>
                  <input
                    type="date"
                    className="w-full glass-input text-xs"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t pt-3">
              <button
                onClick={() => setOrderModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitOrderConversion}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:opacity-95 text-slate-50 text-xs font-bold"
              >
                Create Sales Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
