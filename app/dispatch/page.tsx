'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCRM } from '../../components/crm-provider';
import { useToast } from '../../components/toast-provider';
import { 
  Search, Plus, Truck, Calendar, FileText, CheckCircle2, 
  X, Info, AlertTriangle, PlayCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function DispatchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const { 
    dispatches, orders, orderItems, items: itemMaster, 
    customers, createDispatch, dispatchItems 
  } = useCRM();

  const [search, setSearch] = useState('');
  
  // Dispatch form toggle state
  const [formOpen, setFormOpen] = useState(false);
  
  // Dispatch form fields
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [invoiceNum, setInvoiceNum] = useState('');
  const [transporter, setTransporter] = useState('VRL Logistics');
  const [vehicleNum, setVehicleNum] = useState('');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [trackingInfo, setTrackingInfo] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Quantities to dispatch (keyed by order_item_id)
  const [dispatchQtys, setDispatchQtys] = useState<Record<string, number>>({});

  // Sync selected order from URL search param
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      setSelectedOrderId(orderId);
      setFormOpen(true);
    }
  }, [searchParams]);

  // Load items when selected order changes
  const activeOrder = orders.find(o => o.id === selectedOrderId);
  const activeOrderItems = activeOrder ? orderItems.filter(oi => oi.order_id === selectedOrderId) : [];

  useEffect(() => {
    if (activeOrderItems.length > 0) {
      const initialQtys: Record<string, number> = {};
      activeOrderItems.forEach(oi => {
        const balance = Math.max(0, oi.quantity - (oi.dispatched_quantity || 0));
        initialQtys[oi.id] = balance; // Default to full remaining balance
      });
      setDispatchQtys(initialQtys);
    }
  }, [selectedOrderId, orderItems]);

  const handleQtyChange = (itemId: string, val: number, max: number) => {
    const cleanVal = Math.min(max, Math.max(0, val));
    setDispatchQtys(prev => ({
      ...prev,
      [itemId]: cleanVal
    }));
  };

  const handleSubmitDispatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrderId || !invoiceNum || !vehicleNum) {
      toast('Please enter Invoice Number, Transporter, and Vehicle Number.', 'warning');
      return;
    }

    const itemsPayload = Object.keys(dispatchQtys)
      .map(oiId => ({
        order_item_id: oiId,
        quantity: dispatchQtys[oiId]
      }))
      .filter(item => item.quantity > 0);

    if (itemsPayload.length === 0) {
      toast('Please specify a dispatch quantity greater than 0 for at least one item.', 'warning');
      return;
    }

    try {
      await createDispatch({
        order_id: selectedOrderId,
        customer_id: activeOrder!.customer_id,
        dispatch_date: new Date(dispatchDate).toISOString(),
        invoice_number: invoiceNum,
        transporter,
        vehicle_number: vehicleNum,
        dispatch_status: 'Shipped',
        tracking_info: trackingInfo || undefined,
        remarks: remarks || undefined
      }, itemsPayload);

      toast(`Dispatch invoice ${invoiceNum} registered. Quantities adjusted successfully.`, 'success');
      
      // Reset form
      setFormOpen(false);
      setSelectedOrderId('');
      setInvoiceNum('');
      setVehicleNum('');
      setTrackingInfo('');
      setRemarks('');
      setDispatchQtys({});
      router.push('/dispatch', { scroll: false });
    } catch (err: any) {
      toast(err.message || 'Failed to record dispatch', 'error');
    }
  };

  // Filter lists
  const filteredDispatches = dispatches.filter(d => {
    const cust = customers.find(c => c.id === d.customer_id);
    const ord = orders.find(o => o.id === d.order_id);
    
    return d.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
           d.transporter.toLowerCase().includes(search.toLowerCase()) ||
           (cust && cust.company_name.toLowerCase().includes(search.toLowerCase())) ||
           (ord && ord.order_code.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Logistics & Shipments Registry</p>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Dispatches & Invoices</h1>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Record Dispatch
        </button>
      </div>

      {/* Search filter */}
      <div className="flex items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice, transporter, customer..."
            className="w-full pl-9 pr-4 py-2 text-xs glass-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Dispatches Master Grid */}
      <div className="glass-card overflow-hidden">
        <table className="w-full border-collapse text-left text-xs font-semibold">
          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 uppercase border-b border-slate-200/30 dark:border-slate-800/30">
            <tr>
              <th className="py-3 px-4">Invoice No</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Sales Order</th>
              <th className="py-3 px-4">Dispatch Date</th>
              <th className="py-3 px-4">Transporter</th>
              <th className="py-3 px-4">Vehicle Number</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/20">
            {filteredDispatches.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-450 font-medium">
                  No dispatch invoice shipments recorded yet.
                </td>
              </tr>
            ) : (
              filteredDispatches.map(d => {
                const cust = customers.find(c => c.id === d.customer_id);
                const ord = orders.find(o => o.id === d.order_id);
                return (
                  <tr key={d.id} className="hover:bg-slate-900/2 dark:hover:bg-slate-100/2 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-slate-150">{d.invoice_number}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-350">{cust ? cust.company_name : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-450 font-bold">{ord ? ord.order_code : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium font-sans">
                      {format(new Date(d.dispatch_date), 'dd MMM yyyy')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">{d.transporter}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{d.vehicle_number}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {d.dispatch_status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Record Dispatch Modal Form */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border glass-panel p-6 shadow-2xl flex flex-col gap-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wider">
                Record Dispatch Shipment
              </h3>
              <button
                onClick={() => {
                  setFormOpen(false);
                  setSelectedOrderId('');
                  router.push('/dispatch', { scroll: false });
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-650"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitDispatch} className="space-y-4 text-xs font-semibold">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Active Order *</label>
                  <select
                    className="w-full glass-input text-xs"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                  >
                    <option value="">-- Choose Sales Order --</option>
                    {orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').map(o => {
                      const cust = customers.find(c => c.id === o.customer_id);
                      return (
                        <option key={o.id} value={o.id}>
                          {o.order_code} (PO: {o.po_number}) - {cust?.company_name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Dispatch Invoice No */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    className="w-full glass-input text-xs"
                    placeholder="e.g. INV-2026-0044"
                    value={invoiceNum}
                    onChange={(e) => setInvoiceNum(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Transporter */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Transporter Name *</label>
                  <select
                    className="w-full glass-input text-xs"
                    value={transporter}
                    onChange={(e) => setTransporter(e.target.value)}
                  >
                    <option value="VRL Logistics">VRL Logistics</option>
                    <option value="GATI Logistics">GATI Logistics</option>
                    <option value="TCI Express">TCI Express</option>
                    <option value="Safeexpress">Safeexpress</option>
                    <option value="Self / Customer Pick">Self / Customer Pick</option>
                  </select>
                </div>

                {/* Vehicle No */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    className="w-full glass-input text-xs font-mono"
                    placeholder="e.g. TN-37-CF-1234"
                    value={vehicleNum}
                    onChange={(e) => setVehicleNum(e.target.value)}
                  />
                </div>

                {/* Dispatch Date */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dispatch Date *</label>
                  <input
                    type="date"
                    className="w-full glass-input text-xs"
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Items dispatch grid */}
              {activeOrder && activeOrderItems.length > 0 && (
                <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-3">
                    Quantities to Dispatch
                  </span>

                  <div className="flex flex-col gap-3">
                    {activeOrderItems.map(oi => {
                      const itemObj = itemMaster.find(it => it.id === oi.item_id);
                      const balance = Math.max(0, oi.quantity - (oi.dispatched_quantity || 0));

                      return (
                        <div key={oi.id} className="p-3.5 rounded-xl border border-slate-250/20 bg-slate-900/1 dark:bg-slate-100/1 flex items-center justify-between gap-4">
                          <div className="grow overflow-hidden">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {itemObj?.item_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                              Ordered: {oi.quantity} &bull; Dispatched: {oi.dispatched_quantity || 0} &bull; Balance: {balance} Pcs
                            </span>
                          </div>
                          
                          <div className="w-32 shrink-0">
                            <label className="block text-[9px] text-slate-400 uppercase mb-0.5">This Dispatch Qty</label>
                            <input
                              type="number"
                              className="w-full glass-input text-xs text-center"
                              value={dispatchQtys[oi.id] || 0}
                              onChange={(e) => handleQtyChange(oi.id, Number(e.target.value), balance)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tracking info */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tracking Info / URL</label>
                <input
                  type="text"
                  className="w-full glass-input text-xs"
                  placeholder="e.g. https://vrl.in/track/12390"
                  value={trackingInfo}
                  onChange={(e) => setTrackingInfo(e.target.value)}
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Remarks</label>
                <textarea
                  rows={2}
                  className="w-full glass-input text-xs font-semibold"
                  placeholder="Special loading, core test attachments included, etc..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setSelectedOrderId('');
                    router.push('/dispatch', { scroll: false });
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedOrderId}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Confirm Shipment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
