"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phoneOrEmail) {
      toast.error("Please fill in both fields");
      return;
    }

    setLoading(true);
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phoneOrEmail }),
      });
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
      } else {
        toast.error(json.error || "Order not found");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <FiClock className="text-amber-500" />;
      case "confirmed": return <FiCheckCircle className="text-blue-500" />;
      case "processing": return <FiPackage className="text-indigo-500" />;
      case "shipped": return <FiTruck className="text-purple-500" />;
      case "delivered": return <FiCheckCircle className="text-emerald-500" />;
      case "cancelled": return <FiAlertCircle className="text-rose-500" />;
      default: return <FiClock className="text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F8]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Track Your Order</h1>
          <p className="text-slate-600">Enter your order details to see real-time status updates.</p>
        </div>

        <div className="bg-white shadow-xl border border-slate-200 rounded-3xl overflow-hidden mb-8">
          <form onSubmit={handleTrack} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 border-b border-slate-200">
            <Input 
              label="Order Number" 
              placeholder="#ELM-12345" 
              value={orderNumber} 
              onChange={(e) => setOrderNumber(e.target.value)} 
              id="track-order-number"
            />
            <Input 
              label="Email or Phone" 
              placeholder="Your email or phone number" 
              value={phoneOrEmail} 
              onChange={(e) => setPhoneOrEmail(e.target.value)} 
              id="track-contact"
            />
            <Button type="submit" isLoading={loading} className="w-full h-[46px] rounded-xl">
              <FiSearch className="mr-2" /> Track Order
            </Button>
          </form>

          {order ? (
            <div className="p-6 md:p-8 space-y-8 animate-fade-in">
              {/* Status Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Current Status</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getStatusIcon(order.orderStatus)}</span>
                    <h2 className="text-2xl font-bold text-slate-900 capitalize">{order.orderStatus}</h2>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Order Date</p>
                  <p className="text-slate-900 font-semibold">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FiClock className="text-blue-500" /> Tracking History
                </h3>
                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {order.trackingHistory.slice().reverse().map((item: any, idx: number) => (
                    <div key={idx} className="relative pl-10">
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${idx === 0 ? 'bg-blue-500' : 'bg-slate-300'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold capitalize ${idx === 0 ? 'text-blue-600' : 'text-slate-600'}`}>
                            {item.status}
                          </span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Elements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 mb-4">Shipping To</h3>
                  <div className="p-4 bg-slate-50 rounded-2xl text-sm text-slate-600 space-y-1">
                    <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city} - {order.shippingAddress.postalCode}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="text-slate-900">{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Discount</span>
                        <span>- {formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Shipping</span>
                      <span className="text-slate-900">{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-100">
                      <span className="text-slate-900">Total</span>
                      <span className="text-slate-900">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !loading && (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPackage className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-500">Enter your order details above to track your package.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
