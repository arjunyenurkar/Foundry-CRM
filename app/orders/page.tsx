'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCRM } from '../../components/crm-provider';
import { useToast } from '../../components/toast-provider';
import { 
  Search, Filter, ChevronRight, X, Truck, Calendar, ShoppingBag, 
  DollarSign, FileCheck, CheckCircle2, Factory, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const { 
    orders, customers, orderItems, items: itemMaster, 
    updateOrder, hasPermission, quotations 
  } = useCRM();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedOrderId(id);
    }
  }, [searchParams]);

  const handleSelectOrder = (id: string) => {
    setSelectedOrderId(id);
    router.push(`/orders?id=${id}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    setSelectedOrderId(null);
    router.push('/orders', { scroll: false });
  };

  const handleChangeStatus = async (id: string, newStatus: any) => {
    try {
      await updateOrder(id, { status: newStatus });
      toast(`Order status changed to ${newStatus}`, 'success');
    } catch (e: any) {
      toast('Failed to change order status', 'error');
    }
  };

  // Filter list
  const filteredOrders = orders.filter(o => {
    const cust = customers.find(c => c.id === o.customer_id);
    const matchSearch = o.order_code.toLowerCase().includes(search.toLowerCase()) ||
                        o.po_number.toLowerCase().includes(search.toLowerCase()) ||
                        (cust && cust.company_name.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const order = orders.find(o => o.id === selectedOrderId);
  const customer = order ? customers.find(c => c.id === order.customer_id) : null;
  const quote = order ? quotations.find(q => q.id === order.quotation_id) : null;
  const oItems = order ? orderItems.filter(oi => oi.order_id === order.id) : [];

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] relative overflow-hidden">
      
      {/* Master List */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedOrderId ? 'lg:w-[45%]' : 'w-full'}`}>
        
        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders, PO, customer..."
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
              <option value="all">All Orders</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Production">In Production</option>
              <option value="Partially Dispatched">Partially Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="grow overflow-y-auto glass-card">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10 text-slate-500 uppercase border-b border-slate-200/30 dark:border-slate-800/30">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 hidden sm:table-cell">PO Number</th>
                <th className="py-3 px-4 hidden md:table-cell">Delivery Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-250/20 dark:divide-slate-800/20">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-450 font-medium">
                    No orders registered yet.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => {
                  const cust = customers.find(c => c.id === o.customer_id);
                  const isSelected = o.id === selectedOrderId;
                  return (
                    <tr
                      key={o.id}
                      onClick={() => handleSelectOrder(o.id)}
                      className={`hover:bg-slate-900/2 dark:hover:bg-slate-100/2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-500/5 dark:bg-blue-400/5 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-450 dark:text-slate-500">{o.order_code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-slate-150">{cust ? cust.company_name : 'Unknown Customer'}</td>
                      <td className="py-3.5 px-4 hidden sm:table-cell text-slate-500 font-medium">{o.po_number}</td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-500 font-medium font-sans">
                        {format(new Date(o.expected_delivery_date), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">₹{o.total_amount.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          o.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                          o.status === 'Partially Dispatched' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                          o.status === 'In Production' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {o.status}
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

      {/* Order Detail View Panel */}
      {order && customer && (
        <div className="w-full lg:w-[50%] h-full rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-2xl flex flex-col overflow-hidden z-25 absolute lg:relative inset-y-0 right-0">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between">
            <div className="grow overflow-hidden pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Order: {order.order_code} &bull; Date: {format(new Date(order.order_date), 'dd MMM yyyy')}
              </span>
              <h2 className="text-base font-bold text-slate-850 dark:text-slate-150 truncate mt-0.5 leading-snug">
                {customer.company_name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              
              {/* Status workflow selector */}
              {hasPermission('update', 'orders') && (
                <select
                  value={order.status}
                  onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                  className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-lg py-1.5 px-2 outline-none font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Production">In Production</option>
                  <option value="Partially Dispatched">Partially Dispatched</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              )}

              {/* Dispatch shipping shortcut */}
              {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                <button
                  onClick={() => {
                    toast('Redirecting to ship items for this order...', 'info');
                    router.push(`/dispatch?orderId=${order.id}`);
                  }}
                  className="flex items-center gap-1 bg-emerald-500 hover:opacity-95 text-slate-50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" /> Dispatch
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

          <div className="grow overflow-y-auto p-4 space-y-5 select-text">
            
            {/* Purchase order details */}
            <div className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs">
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-150 uppercase tracking-wide border-b pb-2 mb-3">
                Purchase Order & Scheduling
              </h4>
              <div className="grid grid-cols-2 gap-3 text-slate-550 dark:text-slate-400 font-semibold">
                <div><span className="text-slate-400 block font-normal">Customer PO:</span> {order.po_number}</div>
                <div><span className="text-slate-400 block font-normal">PO Date:</span> {format(new Date(order.po_date), 'dd MMM yyyy')}</div>
                <div><span className="text-slate-400 block font-normal">Exp. Delivery:</span> {format(new Date(order.expected_delivery_date), 'dd MMM yyyy')}</div>
                {quote && (
                  <div>
                    <span className="text-slate-400 block font-normal">Reference Quote:</span>
                    <a href={`/quotations?id=${quote.id}`} className="text-blue-500 font-bold hover:underline">{quote.quotation_code}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-3">
                Order Line Items & Balances
              </span>

              <div className="flex flex-col gap-3">
                {oItems.map((oi, idx) => {
                  const itemObj = itemMaster.find(it => it.id === oi.item_id);
                  const dispatched = oi.dispatched_quantity || 0;
                  const balance = Math.max(0, oi.quantity - dispatched);

                  return (
                    <div 
                      key={oi.id}
                      className="p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-900/1 dark:bg-slate-100/1 text-xs"
                    >
                      <div className="flex justify-between items-start border-b border-slate-200/15 pb-2 mb-2">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">
                            {idx + 1}. {itemObj?.item_name}
                          </span>
                          <span className="text-[10px] text-slate-450 block font-mono mt-0.5">Dwg: {itemObj?.drawing_number}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">₹{oi.amount.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block font-normal font-sans">Rate: ₹{oi.rate}</span>
                        </div>
                      </div>

                      {/* Dispatched vs Balance grid */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1 font-semibold">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900">
                          <span className="text-slate-400 block font-normal uppercase text-[8px]">Ordered</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold">{oi.quantity} Pcs</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-blue-500/5 text-blue-600">
                          <span className="text-slate-400 block font-normal uppercase text-[8px]">Dispatched</span>
                          <span className="font-bold">{dispatched} Pcs</span>
                        </div>
                        <div className={`p-1.5 rounded-lg font-bold ${balance > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                          <span className="text-slate-400 block font-normal uppercase text-[8px]">Balance</span>
                          <span>{balance} Pcs</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 glass-panel text-xs font-semibold">
              <span className="text-slate-450 dark:text-slate-400">Total Purchase Commitment Value:</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-50 font-mono">
                ₹{order.total_amount.toLocaleString()}
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
