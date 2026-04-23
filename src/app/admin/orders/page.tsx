"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import type { IOrder } from "@/types";
import { FiPackage, FiTruck, FiMapPin, FiClock, FiSearch } from "react-icons/fi";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [detailOrder, setDetailOrder] = useState<IOrder | null>(null);
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: "", estimatedDelivery: "", notes: "" });
  const [searchFilter, setSearchFilter] = useState("");
  const [refundForm, setRefundForm] = useState({ amount: 0, reason: "" });
  const [refunding, setRefunding] = useState(false);

  const fetchOrders = async () => {
    const url = statusFilter ? `/api/orders?limit=100&status=${statusFilter}` : "/api/orders?limit=100";
    const res = await fetch(url);
    const json = await res.json();
    if (json.success) setOrders(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (orderId: string, orderStatus: string, extra?: Record<string, string>) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus, ...extra }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success(`STATUS: ${orderStatus.toUpperCase()}`);
      fetchOrders();
      if (detailOrder?._id === orderId) {
        setDetailOrder(json.data);
      }
    } else toast.error(json.error || "OPERATION FAILED");
  };

  const handleShipOrder = async (orderId: string) => {
    await updateStatus(orderId, "shipped", {
      trackingNumber: trackingForm.trackingNumber,
      estimatedDelivery: trackingForm.estimatedDelivery,
      notes: trackingForm.notes,
    });
    setTrackingForm({ trackingNumber: "", estimatedDelivery: "", notes: "" });
  };

  const handleProcessRefund = async (orderId: string) => {
    if (refundForm.amount <= 0) return toast.error("INVALID AMOUNT");
    setRefunding(true);
    const res = await fetch(`/api/orders/${orderId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refundForm),
    });
    const json = await res.json();
    setRefunding(false);
    if (json.success) {
      toast.success(`REFUND PROCESSED: ${formatPrice(refundForm.amount)}`);
      setRefundForm({ amount: 0, reason: "" });
      fetchOrders();
      setDetailOrder(json.data);
    } else toast.error(json.error || "REFUND FAILED");
  };

  const statusColors: Record<string, string> = {
    pending: "text-amber-500 border-amber-500/30 bg-amber-500/10", 
    confirmed: "text-blue-500 border-blue-500/30 bg-blue-500/10", 
    processing: "text-indigo-500 border-indigo-500/30 bg-indigo-500/10",
    shipped: "text-cyan-500 border-cyan-500/30 bg-cyan-500/10", 
    delivered: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10", 
    cancelled: "text-red-500 border-red-500/30 bg-red-500/10",
  };

  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  const filteredOrders = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    ((o.user as { name: string })?.name || "").toLowerCase().includes(searchFilter.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`COPIED: ${text}`);
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-[#ef4a23]" />
            <h2 className="text-[10px] font-black tracking-[0.4em] text-[#ef4a23] uppercase italic">Logistics Matrix</h2>
        </div>
        <h1 className="text-3xl lg:text-4xl font-[1000] text-white tracking-tighter uppercase italic">
          Active <span className="text-white/20">Deployments</span>
        </h1>
      </div>

      {/* Control Panel */}
      <div className="bg-[#111119] border border-white/[0.06] p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input type="text" placeholder="SCAN DEPLOYMENTS..." value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] text-[11px] font-bold tracking-[0.2em] text-white placeholder-white/30 uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors" />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={() => setStatusFilter("")}
            className={`px-4 py-3 text-[9px] font-black tracking-widest uppercase italic transition-colors border ${!statusFilter ? "bg-[#ef4a23] text-white border-[#ef4a23]" : "text-white/40 border-white/10 hover:text-white hover:border-white/30"}`}>
            All Codes
          </button>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-3 text-[9px] font-black tracking-widest uppercase italic transition-colors border ${statusFilter === s ? "bg-[#ef4a23] text-white border-[#ef4a23]" : "text-white/40 border-white/10 hover:text-white hover:border-white/30"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111119] border border-white/[0.06]">
        {loading ? <div className="p-12 text-center text-[10px] font-black tracking-[0.4em] text-white/20 uppercase italic animate-pulse">Initializing Matrix...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Deployment ID</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Operative</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Assets</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Payload</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Clearance</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Status</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Command</th>
                  <th className="py-4 px-5" />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <button 
                        onClick={() => copyToClipboard(order.orderNumber)}
                        className="font-black text-white text-[12px] uppercase italic tracking-wider leading-tight hover:text-[#ef4a23] transition-colors text-left"
                      >
                        {order.orderNumber}
                      </button>
                      <p className="text-[9px] font-bold tracking-widest text-[#ef4a23] uppercase italic mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-white text-[11px] uppercase truncate">{(order.user as { name: string })?.name || "—"}</p>
                      <p className="text-[10px] text-white/40 tracking-wider">{(order.user as { email: string })?.email}</p>
                    </td>
                    <td className="py-4 px-5">
                       <span className="text-[11px] font-bold text-white/60 tracking-widest uppercase italic">{order.items.length} units</span>
                    </td>
                    <td className="py-4 px-5">
                       <span className="text-[13px] font-black text-white italic tracking-wider">{formatPrice(order.total)}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-1 text-[9px] font-black tracking-widest uppercase italic border ${order.paymentStatus === "paid" ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" : "text-amber-500 border-amber-500/30 bg-amber-500/10"}`}>
                         {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                       <span className={`px-2 py-1 text-[9px] font-black tracking-widest uppercase italic border ${statusColors[order.orderStatus] || "text-white/60 border-white/20 bg-white/5"}`}>
                         {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="relative inline-block">
                        <select value={order.orderStatus} onChange={(e) => updateStatus(order._id, e.target.value)}
                          className="px-3 py-2 bg-[#111119] border border-white/20 text-[10px] font-bold tracking-widest text-white uppercase italic outline-none focus:border-[#ef4a23] transition-colors cursor-pointer appearance-none min-w-[120px]">
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[8px]">▼</div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button onClick={() => setDetailOrder(order)}
                        className="px-4 py-2 border border-white/20 text-white/60 text-[9px] font-black tracking-widest uppercase italic hover:bg-white hover:text-black hover:border-white transition-colors cursor-pointer">
                        Intel
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && <tr><td colSpan={8} className="py-16 text-center text-[10px] font-black tracking-[0.4em] text-white/20 uppercase italic">No Deployments Detected</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Order Detail Modal */}
      <Modal isOpen={!!detailOrder} onClose={() => setDetailOrder(null)} title={`Deployment ${detailOrder?.orderNumber || ""}`}>
        {detailOrder && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Items */}
            <div>
              <h3 className="text-[11px] font-black text-[#ef4a23] uppercase tracking-[0.2em] italic mb-3 flex items-center gap-2"><FiPackage size={14} /> Payload Details</h3>
              <div className="space-y-2">
                {detailOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <p className="text-[12px] text-white font-bold uppercase italic">{item.productName}</p>
                      <p className="text-[10px] text-white/40 tracking-widest uppercase mt-1">{Object.values(item.variant.combination).join(", ")} × {item.quantity}</p>
                    </div>
                    <span className="text-[14px] text-white font-black italic">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h3 className="text-[11px] font-black text-[#ef4a23] uppercase tracking-[0.2em] italic mb-3 flex items-center gap-2"><FiMapPin size={14} /> Extraction Point</h3>
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] text-[11px] font-medium tracking-wide text-white/60 leading-relaxed uppercase">
                <p className="text-white font-bold">{detailOrder.shippingAddress.fullName}</p>
                <p>{detailOrder.shippingAddress.phone}</p>
                <p>{detailOrder.shippingAddress.address}</p>
                <p>{detailOrder.shippingAddress.city} - {detailOrder.shippingAddress.postalCode}</p>
              </div>
            </div>

            {/* Tracking History */}
            <div>
              <h3 className="text-[11px] font-black text-[#ef4a23] uppercase tracking-[0.2em] italic mb-3 flex items-center gap-2"><FiClock size={14} /> Event Log</h3>
              {detailOrder.trackingHistory && detailOrder.trackingHistory.length > 0 ? (
                <div className="space-y-0 p-4 border border-white/[0.06]">
                  {detailOrder.trackingHistory.map((event, i) => (
                    <div key={i} className="flex gap-4 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-none rotate-45 border ${i === detailOrder.trackingHistory!.length - 1 ? "bg-[#ef4a23] border-[#ef4a23]" : "bg-transparent border-white/20"}`} />
                        {i < detailOrder.trackingHistory!.length - 1 && <div className="w-px flex-1 bg-white/10 mt-2" />}
                      </div>
                      <div className="flex-1 -mt-1">
                        <p className="text-[11px] text-white font-bold uppercase tracking-widest">{event.status}</p>
                        <p className="text-[10px] text-white/40 mt-1">{event.message}</p>
                        <p className="text-[9px] font-black tracking-widest text-[#ef4a23] mt-1 italic">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-white/40 tracking-widest uppercase italic border border-white/[0.06] p-4 text-center">No Signals Detected</p>
              )}
            </div>

            {/* Tracking Number & Ship */}
            {detailOrder.orderStatus === "processing" && (
               <div className="p-4 bg-white/[0.02] border border-white/[0.06] space-y-4">
               <h3 className="text-[11px] font-black text-[#ef4a23] uppercase tracking-[0.2em] italic flex items-center gap-2"><FiTruck size={14} /> Transmit Routing</h3>
               <Input label="Tracking Code" value={trackingForm.trackingNumber} onChange={e => setTrackingForm(f => ({ ...f, trackingNumber: e.target.value }))} placeholder="LZ-XX-000" id="tracking-number" />
               <Input label="ETA" type="date" value={trackingForm.estimatedDelivery} onChange={e => setTrackingForm(f => ({ ...f, estimatedDelivery: e.target.value }))} id="est-delivery" />
               <Input label="Directives" value={trackingForm.notes} onChange={e => setTrackingForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional directives" id="ship-notes" />
               <button onClick={() => handleShipOrder(detailOrder._id)} className="w-full py-3 bg-[#ef4a23] text-white text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-white hover:text-black transition-colors flex justify-center items-center gap-2">
                 <FiTruck /> Execute Transmit
               </button>
             </div>
            )}

            {/* Order Summary */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] text-[11px] font-bold tracking-widest uppercase space-y-2">
              <div className="flex justify-between text-white/40"><span>Payload Base</span><span>{formatPrice(detailOrder.subtotal)}</span></div>
              <div className="flex justify-between text-white/40"><span>Transit Cost</span><span>{detailOrder.shippingCost === 0 ? "WAIVED" : formatPrice(detailOrder.shippingCost)}</span></div>
              {detailOrder.discount > 0 && <div className="flex justify-between text-emerald-500"><span>Override Deduction</span><span>-{formatPrice(detailOrder.discount)}</span></div>}
              <div className="flex justify-between text-white font-black text-[13px] italic border-t border-white/[0.06] pt-3 mt-1"><span>Total Clearance</span><span>{formatPrice(detailOrder.total)}</span></div>
              {detailOrder.refundedAmount && detailOrder.refundedAmount > 0 && (
                <div className="flex justify-between text-red-500 font-black text-[11px] italic"><span>Reimbursed</span><span>-{formatPrice(detailOrder.refundedAmount)}</span></div>
              )}
            </div>

            {/* Refund Action (Admin only) */}
            <div className="p-4 bg-red-500/5 border border-red-500/20 space-y-4">
              <h3 className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
                <FiPackage size={14} /> Initiate Reimbursement
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Amount" 
                  type="number" 
                  value={refundForm.amount || ""} 
                  onChange={e => setRefundForm(f => ({ ...f, amount: Number(e.target.value) }))} 
                  placeholder="0.00" 
                  id="refund-amount" 
                />
                <Input 
                  label="Code/Reason" 
                  value={refundForm.reason} 
                  onChange={e => setRefundForm(f => ({ ...f, reason: e.target.value }))} 
                  placeholder="Protocol Error" 
                  id="refund-reason" 
                />
              </div>
              <button 
                onClick={() => handleProcessRefund(detailOrder._id)} 
                disabled={refunding}
                className="w-full py-3 bg-red-500/10 border border-red-500 text-red-500 text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
              >
                {refunding ? "EXECUTING..." : "CONFIRM REIMBURSEMENT"}
              </button>
              <p className="text-[9px] text-white/30 text-center uppercase tracking-widest font-bold">
                Max Authorization: {formatPrice(detailOrder.total - (detailOrder.refundedAmount || 0))}
              </p>
            </div>

            {/* Refund History */}
            {detailOrder.refunds && detailOrder.refunds.length > 0 && (
              <div>
                <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] italic mb-3">Reimbursement Log</h3>
                <div className="space-y-2">
                  {detailOrder.refunds.map((r, i) => (
                    <div key={i} className="p-4 bg-red-500/5 border border-red-500/10 flex justify-between items-center">
                      <div>
                        <p className="text-[12px] font-black text-red-500 italic">-{formatPrice(r.amount)}</p>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">{r.reason}</p>
                      </div>
                      <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase">{new Date(r.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
