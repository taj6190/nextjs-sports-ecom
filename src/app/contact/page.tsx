"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FiPhone, FiMail, FiMapPin, FiClock, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all transmission fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Transmission received. HQ notified.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(data.error || "Transmission failure");
      }
    } catch {
      toast.error("Critical communication failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#081621] selection:bg-[#ef4a23] selection:text-white relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#111_1px,transparent_0)] [background-size:24px_24px]" />

      <Header />
      
      <main className="relative z-10 pt-20 pb-24 md:pt-32 md:pb-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* Simplified Contact Intel - Left Section */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-1 bg-[#ef4a23]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ef4a23] italic">Support Hub</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-[1000] uppercase italic tracking-tighter text-[#081621]">
                  Contact <span className="text-[#ef4a23]">Intelligence</span>.
                </h1>
                <p className="text-[14px] font-bold text-[#081621]/40 uppercase tracking-wide leading-relaxed max-w-sm">
                  Connect with our technical support team for gear assistance, logistics tracking, and wholesale inquiries.
                </p>
              </div>

              <div className="space-y-8 pt-4">
                {[
                  { icon: FiPhone, label: "Tactical Line", val: "+880 1XXX-XXXXXX" },
                  { icon: FiMail, label: "Digital Comms", val: "support@electromart.com.bd" },
                  { icon: FiMapPin, label: "Base Ops", val: "Dhaka, Bangladesh" },
                  { icon: FiClock, label: "Operational", val: "Sat-Thu | 10:00 - 20:00" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="w-10 h-10 border border-[#eee] flex items-center justify-center text-[#081621]/40 group-hover:text-[#ef4a23] group-hover:border-[#ef4a23] transition-all shrink-0">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ef4a23] mb-1">{item.label}</p>
                      <p className="text-[15px] font-black uppercase tracking-tighter text-[#081621]">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-7 w-full pt-8 lg:pt-0">
               <div className="bg-white border-2 border-[#081621] p-6 md:p-12 lg:p-16 relative">
                  {/* Tactical ID Marker */}
                  <div className="absolute top-0 right-0 bg-[#081621] text-white px-4 py-1 text-[9px] font-black uppercase tracking-[0.3em] italic">
                    Log: {new Date().toISOString().split('T')[0].replace(/-/g, '.')}
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-[1000] uppercase italic tracking-tighter mb-10 md:mb-12 border-b-2 border-[#eee] pb-6 flex items-center gap-4">
                     <span className="w-4 h-4 bg-[#ef4a23] rotate-45 shrink-0" />
                     Secure // Transmission
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                        <div className="space-y-2 md:space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#081621]/40">Identity // Name</label>
                           <input 
                             type="text" 
                             placeholder="ENTER CALLSIGN" 
                             value={formData.name}
                             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                             className="w-full bg-[#fcfcfc] border border-[#eee] px-5 py-3 md:px-6 md:py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-[#ef4a23] transition-all placeholder:text-[#ddd]" 
                           />
                        </div>
                        <div className="space-y-2 md:space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#081621]/40">Contact // Email</label>
                           <input 
                             type="email" 
                             placeholder="HQ@PROTOCOL.COM" 
                             value={formData.email}
                             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                             className="w-full bg-[#fcfcfc] border border-[#eee] px-5 py-3 md:px-6 md:py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-[#ef4a23] transition-all placeholder:text-[#ddd]" 
                           />
                        </div>
                     </div>

                     <div className="space-y-2 md:space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#081621]/40">Subject // Directive</label>
                        <input 
                          type="text" 
                          placeholder="MISSION TYPE" 
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full bg-[#fcfcfc] border border-[#eee] px-5 py-3 md:px-6 md:py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-[#ef4a23] transition-all placeholder:text-[#ddd]" 
                        />
                     </div>

                     <div className="space-y-2 md:space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#081621]/40">Intelligence // Message</label>
                        <textarea 
                          rows={4} 
                          placeholder="TRANSMIT DETAILS..." 
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full bg-[#fcfcfc] border border-[#eee] px-5 py-3 md:px-6 md:py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-[#ef4a23] transition-all placeholder:text-[#ddd] resize-none" 
                        />
                     </div>

                     <button 
                       disabled={loading}
                       className="w-full bg-[#081621] text-white py-5 md:py-6 text-[12px] font-black uppercase italic tracking-[0.4em] hover:bg-[#ef4a23] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group"
                     >
                        {loading ? "Transmitting..." : "Send Transmission"}
                        <FiArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                     </button>
                  </form>
               </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}




