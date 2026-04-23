"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FiPhone, FiMail, FiMapPin, FiClock, FiArrowRight } from "react-icons/fi";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24 pb-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* Contact Intel */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-12 h-1 bg-[#ef4a23]" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#ef4a23] italic">Support // Channels</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-[1000] text-[#081621] uppercase italic tracking-tighter leading-none mb-12">
                Establish <br />
                <span className="text-[#ef4a23]">Comms</span>.
              </h1>

              <div className="space-y-12 mb-16">
                 {[
                   { icon: FiPhone, label: "Tactical Line", val: "+880 1XXX-XXXXXX", desc: "Available 10:00 - 20:00 GMT+6" },
                   { icon: FiMail, label: "Digital Comms", val: "support@electromart.com.bd", desc: "24-hour response protocol" },
                   { icon: FiMapPin, label: "Base Operations", val: "Dhaka, Bangladesh", desc: "HQ & Logistics Deployment Center" },
                   { icon: FiClock, label: "Operational Hours", val: "Sat - Thu", desc: "Friday: Offline for maintenance" }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-[#081621] text-white flex items-center justify-center rotate-45 shrink-0">
                         <item.icon size={20} className="-rotate-45" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ef4a23] mb-1">{item.label}</p>
                         <p className="text-xl font-black uppercase italic tracking-tighter text-[#081621]">{item.val}</p>
                         <p className="text-[12px] font-bold text-[#081621]/40 uppercase tracking-widest mt-1">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* Transmission Form */}
            <div className="bg-[#f8f8f8] p-10 md:p-16 border border-[#eee]">
               <h2 className="text-3xl font-[1000] uppercase tracking-tighter mb-10 italic">Secure // <span className="text-[#ef4a23]">Transmission</span></h2>
               <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#081621]">Identity // Name</label>
                        <input type="text" placeholder="Callsign" className="w-full bg-white border border-[#eee] px-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-[#ef4a23] transition-colors" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#081621]">Contact // Email</label>
                        <input type="email" placeholder="digital-address@domain.com" className="w-full bg-white border border-[#eee] px-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-[#ef4a23] transition-colors" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#081621]">Subject // Directive</label>
                     <input type="text" placeholder="Operation Type" className="w-full bg-white border border-[#eee] px-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-[#ef4a23] transition-colors" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#081621]">Intelligence // Message</label>
                     <textarea rows={6} placeholder="Transmission details..." className="w-full bg-white border border-[#eee] px-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-[#ef4a23] transition-colors resize-none" />
                  </div>
                  <button className="w-full bg-[#081621] text-white py-6 text-[12px] font-black uppercase italic tracking-[0.3em] hover:bg-[#ef4a23] transition-all flex items-center justify-center gap-4">
                     Send Transmission <FiArrowRight />
                  </button>
               </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
