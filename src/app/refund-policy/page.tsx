"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FiRefreshCw, FiTruck, FiAlertCircle } from "react-icons/fi";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />
      <main className="pt-24 pb-32">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-24">
            <span className="text-[#ef4a23] font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">// Logistics Neutralization</span>
            <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic tracking-tighter text-[#081621] leading-none mb-8">
              Refund & <br />
              <span className="text-[#ef4a23]">Returns</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { icon: FiRefreshCw, title: "7-Day Window", text: "Assets can be returned within 7 days of deployment if found defective or incorrect." },
              { icon: FiTruck, title: "Original State", text: "Gear must be returned in original packaging with all tactical tags attached." },
              { icon: FiAlertCircle, title: "Exclusions", text: "Custom jerseys or utilized gear cannot be returned for hygiene and structural reasons." }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[#eee] p-10 text-center flex flex-col items-center group hover:border-[#081621] transition-all">
                <div className="w-16 h-16 bg-[#f8f8f8] text-[#081621] flex items-center justify-center mb-8 border border-[#eee] group-hover:bg-[#081621] group-hover:text-white transition-all">
                  <item.icon size={24} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tighter mb-4 italic">{item.title}</h3>
                <p className="text-[12px] font-bold text-[#081621]/40 uppercase tracking-widest leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#081621] text-white p-12 md:p-20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef4a23] opacity-10 rounded-full blur-3xl -mr-32 -mt-32" />
             <h2 className="text-3xl font-[1000] uppercase tracking-tighter italic mb-10 relative z-10">Standard <span className="text-[#ef4a23]">Return Protocol</span></h2>
             <div className="space-y-8 relative z-10">
                <div className="flex gap-6">
                   <span className="text-[14px] font-black text-[#ef4a23] italic mt-1">STEP 01</span>
                   <p className="text-[14px] font-medium uppercase tracking-widest text-white/70 leading-relaxed">
                     Contact our support terminal via email or phone within the 7-day operational window. Provide your gear manifest ID (Order Number).
                   </p>
                </div>
                <div className="flex gap-6">
                   <span className="text-[14px] font-black text-[#ef4a23] italic mt-1">STEP 02</span>
                   <p className="text-[14px] font-medium uppercase tracking-widest text-white/70 leading-relaxed">
                     Once authorized, securely package the asset. Our extraction team will coordinate a pickup or provide shipping coordinates.
                   </p>
                </div>
                <div className="flex gap-6">
                   <span className="text-[14px] font-black text-[#ef4a23] italic mt-1">STEP 03</span>
                   <p className="text-[14px] font-medium uppercase tracking-widest text-white/70 leading-relaxed">
                     Upon successful structural inspection at our facility, the refund will be initiated via your original payment channel within 5-7 business days.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
