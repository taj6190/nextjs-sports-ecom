"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiAlertCircle, FiArrowRight, FiShield } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) {
      toast.error("Enter order identifier");
      return;
    }

    setLoading(true);
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
        toast.success("Signal acquired. Mission data retrieved.");
      } else {
        toast.error(json.error || "No match found in database.");
      }
    } catch {
      toast.error("Critical communication failure");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-amber-500";
      case "confirmed": return "text-blue-500";
      case "processing": return "text-indigo-500";
      case "shipped": return "text-purple-500";
      case "delivered": return "text-[#ef4a23]";
      case "cancelled": return "text-slate-400";
      default: return "text-slate-400";
    }
  };

  const steps = [
    { id: "pending", label: "Ordered", icon: FiClock },
    { id: "confirmed", label: "Confirmed", icon: FiCheckCircle },
    { id: "shipped", label: "Shipped", icon: FiTruck },
    { id: "delivered", label: "Delivered", icon: FiPackage },
  ];

  const getCurrentStepIndex = (status: string) => {
    const idx = steps.findIndex(s => s.id === status);
    if (status === "processing") return 1; // Processing is between confirmed and shipped
    if (status === "cancelled") return -1;
    return idx;
  };

  const currentStep = getCurrentStepIndex(order?.orderStatus || "");

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#081621]">
      <Header />
      
      <main className="pt-20 pb-32">
        <div className="max-w-[800px] mx-auto px-6">
          
          {/* Search Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-[1000] uppercase tracking-tighter mb-4 italic">Track <span className="text-[#ef4a23]">Order</span></h1>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="ORDER ID, EMAIL OR PHONE" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="w-full bg-white border-2 border-[#081621] px-6 py-5 text-sm font-bold uppercase tracking-widest focus:outline-none shadow-[4px_4px_0px_#081621]"
              />
              <button 
                onClick={handleTrack}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ef4a23] text-white p-3 hover:bg-[#081621] transition-colors disabled:opacity-50"
              >
                <FiSearch size={20} />
              </button>
            </div>
          </div>

          {/* Results Area */}
          {order ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               
               {/* 1. Status Stepper Card */}
               <div className="bg-white border-2 border-[#081621] p-8 md:p-12">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ef4a23] mb-1 italic">// Mission Status</p>
                      <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter">{order.orderStatus}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#081621]/30 mb-1 italic">// Estimated ETA</p>
                      <p className="text-sm font-black uppercase tracking-tighter">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : "PENDING"}</p>
                    </div>
                  </div>

                  {/* The Stepper */}
                  <div className="relative pt-12 pb-4">
                    {/* Background Line */}
                    <div className="absolute top-[60px] left-0 w-full h-[2px] bg-[#eee]" />
                    {/* Active Line */}
                    <div 
                      className="absolute top-[60px] left-0 h-[2px] bg-[#ef4a23] transition-all duration-1000" 
                      style={{ width: `${Math.max(0, (currentStep / (steps.length - 1)) * 100)}%` }}
                    />

                    <div className="relative flex justify-between">
                      {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        
                        return (
                          <div key={step.id} className="flex flex-col items-center group">
                            <div className={`w-12 h-12 rotate-45 flex items-center justify-center transition-all duration-500 border-2 ${isActive ? 'bg-[#ef4a23] border-[#ef4a23] text-white shadow-[0_0_15px_rgba(239,74,35,0.4)]' : 'bg-white border-[#eee] text-[#ccc]'}`}>
                              <Icon size={18} className="-rotate-45" />
                            </div>
                            <p className={`mt-6 text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-[#081621]' : 'text-[#ccc]'}`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
               </div>

               {/* 2. Order Intel Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Card */}
                  <div className="bg-white border-2 border-[#081621] p-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ef4a23] mb-6 flex items-center gap-2">
                      <FiTruck /> Logistics // Destination
                    </h3>
                    <div className="space-y-2 text-[13px] font-bold uppercase tracking-widest text-[#081621]/60">
                      <p className="text-[#081621] font-black">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.phone}</p>
                      <p className="leading-relaxed">{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-[#081621] text-white p-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ef4a23] mb-6 flex items-center gap-2">
                      <FiPackage /> Payload // Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-white/40">
                        <span>ASSET COUNT</span>
                        <span className="text-white">{order.items.length} UNITS</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-white/40">
                        <span>TRANSMIT METHOD</span>
                        <span className="text-white uppercase">{order.paymentMethod}</span>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ef4a23]">Total Value</span>
                        <span className="text-3xl font-[1000] italic leading-none">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
               </div>

               {/* 3. Detailed Event Log */}
               <div className="bg-white border-2 border-[#eee] p-8">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#081621]/30 mb-8 italic">// Transmission History</h3>
                  <div className="space-y-8">
                    {order.trackingHistory.slice().reverse().map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-6 items-start group">
                        <div className="text-right w-24 shrink-0">
                          <p className="text-[10px] font-black text-[#081621]/30">{new Date(item.timestamp).toLocaleDateString()}</p>
                          <p className="text-[9px] font-bold text-[#081621]/20 uppercase">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="w-1.5 h-1.5 bg-[#eee] group-first:bg-[#ef4a23] mt-2 shrink-0 rotate-45" />
                        <div>
                          <p className="text-[12px] font-black uppercase tracking-widest text-[#081621] mb-1">{item.message}</p>
                          <p className="text-[10px] font-bold text-[#081621]/40 uppercase tracking-tighter">{item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

            </div>
          ) : !loading && (
            <div className="text-center py-24 bg-white border-2 border-dashed border-[#eee]">
               <FiPackage className="mx-auto text-[#eee] mb-6" size={64} />
               <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#081621]/20 italic">Scanning For Manifest Data</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
