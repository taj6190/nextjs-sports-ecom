"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FiCreditCard, FiPercent, FiCalendar } from "react-icons/fi";

export default function EMIPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24 pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-20">
            <div className="lg:col-span-4">
               <div className="sticky top-28">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-12 h-1 bg-[#ef4a23]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#ef4a23] italic">Financial // Logistics</span>
                  </div>
                  <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter leading-[0.85] mb-10">
                    Deferred <br />
                    Payment <br />
                    <span className="text-[#ef4a23]">Systems</span>
                  </h1>
                  <div className="p-8 bg-[#081621] text-white space-y-4">
                     <p className="text-[12px] font-black uppercase tracking-widest italic text-[#ef4a23]">// Active Availability</p>
                     <p className="text-[14px] font-medium leading-relaxed opacity-70">
                       Acquire elite gear now, distribute the financial impact over 3 to 12 months.
                     </p>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
                  {[
                    { icon: FiCreditCard, title: "Supported Banks", text: "Available for credit card holders of 20+ major financial institutions including City Bank, DBBL, and EBL." },
                    { icon: FiPercent, title: "0% Interest", text: "Select gear tiers qualify for 0% interest EMI for up to 6 months of tenure." },
                    { icon: FiCalendar, title: "Flexible Tenure", text: "Choose from 3, 6, 9, or 12 month deployment cycles to suit your financial mission." },
                    { icon: FiShield, title: "Secure Processing", text: "All EMI transactions are processed through SSLCommerz/Nagad for maximum asset security." }
                  ].map((item, i) => (
                    <div key={i} className="p-8 border border-[#eee] hover:border-[#081621] transition-all">
                       <div className="text-[#ef4a23] mb-6">
                          <item.icon size={28} />
                       </div>
                       <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">{item.title}</h3>
                       <p className="text-[13px] font-bold text-[#081621]/40 uppercase tracking-widest leading-relaxed">{item.text}</p>
                    </div>
                  ))}
               </div>

               <div className="bg-[#f8f8f8] p-10 md:p-16">
                  <h2 className="text-3xl font-[1000] uppercase tracking-tighter italic mb-8">Deployment // <span className="text-[#ef4a23]">Protocol</span></h2>
                  <ol className="space-y-10">
                     <li className="flex gap-8">
                        <span className="text-4xl font-black italic text-[#ef4a23]/30">01</span>
                        <div>
                           <h4 className="text-[16px] font-black uppercase tracking-widest mb-2 italic">Minimum Threshold</h4>
                           <p className="text-[14px] font-medium text-[#081621]/60 leading-relaxed uppercase tracking-wide">
                             Total gear manifest must exceed ৳10,000 to qualify for the EMI deployment protocol.
                           </p>
                        </div>
                     </li>
                     <li className="flex gap-8">
                        <span className="text-4xl font-black italic text-[#ef4a23]/30">02</span>
                        <div>
                           <h4 className="text-[16px] font-black uppercase tracking-widest mb-2 italic">Checkout Procedure</h4>
                           <p className="text-[14px] font-medium text-[#081621]/60 leading-relaxed uppercase tracking-wide">
                             Select "Online Payment" during checkout. On the payment gateway terminal, select the EMI option and choose your provider.
                           </p>
                        </div>
                     </li>
                     <li className="flex gap-8">
                        <span className="text-4xl font-black italic text-[#ef4a23]/30">03</span>
                        <div>
                           <h4 className="text-[16px] font-black uppercase tracking-widest mb-2 italic">Institutional Approval</h4>
                           <p className="text-[14px] font-medium text-[#081621]/60 leading-relaxed uppercase tracking-wide">
                             The transaction will be authorized instantly. Your bank will convert the total amount into monthly installments within 7-10 operational days.
                           </p>
                        </div>
                     </li>
                  </ol>
               </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Add missing icon
import { FiShield } from "react-icons/fi";
