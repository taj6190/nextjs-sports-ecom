"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
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
      toast.success(`Order marked as ${orderStatus}`);
      fetchOrders();
      if (detailOrder?._id === orderId) {
        setDetailOrder(json.data);
      }
    } else toast.error(json.error || "Failed");
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
    if (refundForm.amount <= 0) return toast.error("Enter a valid amount");
    setRefunding(true);
    const res = await fetch(`/api/orders/${orderId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refundForm),
    });
    const json = await res.json();
    setRefunding(false);
    if (json.success) {
      toast.success(`Refund of ${formatPrice(refundForm.amount)} processed`);
      setRefundForm({ amount: 0, reason: "" });
      fetchOrders();
      setDetailOrder(json.data);
    } else toast.error(json.error || "Refund failed");
  };

  const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    pending: "warning", confirmed: "info", processing: "info",
    shipped: "info", delivered: "success", cancelled: "danger",
  };

  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  const filteredOrders = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    ((o.user as { name: string })?.name || "").toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-sm text-slate-500 mt-1">{orders.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input type="text" placeholder="Search by order # or customer..." value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStatusFilter("")}
            className={`px-3 py-2 text-xs rounded-lg cursor-pointer transition-all ${!statusFilter ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
            All
          </button>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs rounded-lg cursor-pointer capitalize transition-all ${statusFilter === s ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Order</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Customer</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Items</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Total</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Payment</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Action</th>
                  <th className="py-4 px-5" />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="py-3 px-5">
                      <p className="font-medium text-white">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3 px-5">
                      <p className="text-white">{(order.user as { name: string })?.name || "—"}</p>
                      <p className="text-xs text-slate-500">{(order.user as { email: string })?.email}</p>
                    </td>
                    <td className="py-3 px-5 text-slate-400">{order.items.length} items</td>
                    <td className="py-3 px-5 text-white font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3 px-5">
                      <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>{order.paymentStatus}</Badge>
                    </td>
                    <td className="py-3 px-5">
                      <Badge variant={statusColors[order.orderStatus] || "default"}>{order.orderStatus}</Badge>
                    </td>
                    <td className="py-3 px-5">
                      <select value={order.orderStatus} onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer">
                        {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-5">
                      <button onClick={() => setDetailOrder(order)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 cursor-pointer transition-all">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-slate-500">No orders found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!detailOrder} onClose={() => setDetailOrder(null)} title={`Order ${detailOrder?.orderNumber || ""}`}>
        {detailOrder && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Items */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><FiPackage size={14} /> Order Items</h3>
              <div className="space-y-2">
                {detailOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between p-3 bg-slate-800/30 rounded-xl text-sm">
                    <div>
                      <p className="text-white font-medium">{item.productName}</p>
                      <p className="text-xs text-slate-500">{Object.values(item.variant.combination).join(", ")} × {item.quantity}</p>
                    </div>
                    <span className="text-white">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><FiMapPin size={14} /> Shipping Address</h3>
              <div className="p-3 bg-slate-800/30 rounded-xl text-sm text-slate-300">
                <p className="font-medium">{detailOrder.shippingAddress.fullName}</p>
                <p>{detailOrder.shippingAddress.phone}</p>
                <p>{detailOrder.shippingAddress.address}</p>
                <p>{detailOrder.shippingAddress.city} - {detailOrder.shippingAddress.postalCode}</p>
              </div>
            </div>

            {/* Tracking History */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><FiClock size={14} /> Tracking History</h3>
              {detailOrder.trackingHistory && detailOrder.trackingHistory.length > 0 ? (
                <div className="space-y-0">
                  {detailOrder.trackingHistory.map((event, i) => (
                    <div key={i} className="flex gap-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i === detailOrder.trackingHistory.length - 1 ? "bg-blue-500" : "bg-slate-600"}`} />
                        {i < detailOrder.trackingHistory.length - 1 && <div className="w-0.5 flex-1 bg-slate-700 mt-1" />}
                      </div>
                      <div className="flex-1 -mt-0.5">
                        <p className="text-sm text-white capitalize font-medium">{event.status}</p>
                        <p className="text-xs text-slate-400">{event.message}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No tracking events yet</p>
              )}
            </div>

            {/* Tracking Number & Ship */}
            {detailOrder.orderStatus === "processing" && (
              <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><FiTruck size={14} /> Ship Order</h3>
                <Input label="Tracking Number" value={trackingForm.trackingNumber} onChange={e => setTrackingForm(f => ({ ...f, trackingNumber: e.target.value }))} placeholder="Enter tracking number" id="tracking-number" />
                <Input label="Estimated Delivery" type="date" value={trackingForm.estimatedDelivery} onChange={e => setTrackingForm(f => ({ ...f, estimatedDelivery: e.target.value }))} id="est-delivery" />
                <Input label="Notes" value={trackingForm.notes} onChange={e => setTrackingForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" id="ship-notes" />
                <Button onClick={() => handleShipOrder(detailOrder._id)} className="w-full">
                  <FiTruck className="mr-2" /> Mark as Shipped
                </Button>
              </div>
            )}

            {/* Order Summary */}
            <div className="p-3 bg-slate-800/30 rounded-xl text-sm space-y-1">
              <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatPrice(detailOrder.subtotal)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Shipping</span><span>{detailOrder.shippingCost === 0 ? "Free" : formatPrice(detailOrder.shippingCost)}</span></div>
              {detailOrder.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-{formatPrice(detailOrder.discount)}</span></div>}
              <div className="flex justify-between text-white font-bold border-t border-slate-700 pt-1"><span>Total</span><span>{formatPrice(detailOrder.total)}</span></div>
              {detailOrder.refundedAmount && detailOrder.refundedAmount > 0 && (
                <div className="flex justify-between text-red-400 font-bold"><span>Refunded</span><span>-{formatPrice(detailOrder.refundedAmount)}</span></div>
              )}
            </div>

            {/* Refund Action (Admin only) */}
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                <FiPackage size={14} /> Process Refund
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  label="Refund Amount" 
                  type="number" 
                  value={refundForm.amount || ""} 
                  onChange={e => setRefundForm(f => ({ ...f, amount: Number(e.target.value) }))} 
                  placeholder="0.00" 
                  id="refund-amount" 
                  className="bg-slate-900/50 border-slate-700"
                />
                <Input 
                  label="Reason" 
                  value={refundForm.reason} 
                  onChange={e => setRefundForm(f => ({ ...f, reason: e.target.value }))} 
                  placeholder="Defective, Return, etc." 
                  id="refund-reason" 
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <Button 
                onClick={() => handleProcessRefund(detailOrder._id)} 
                isLoading={refunding} 
                variant="danger" 
                className="w-full text-xs"
              >
                Execute Refund
              </Button>
              <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">
                Max available: {formatPrice(detailOrder.total - (detailOrder.refundedAmount || 0))}
              </p>
            </div>

            {/* Refund History */}
            {detailOrder.refunds && detailOrder.refunds.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Refund History</h3>
                <div className="space-y-2">
                  {detailOrder.refunds.map((r, i) => (
                    <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-red-400">-{formatPrice(r.amount)}</p>
                        <p className="text-[10px] text-slate-500 italic">{r.reason}</p>
                      </div>
                      <span className="text-[10px] text-slate-600">{new Date(r.timestamp).toLocaleDateString()}</span>
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
