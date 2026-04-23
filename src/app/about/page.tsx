"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FiTarget, FiAward, FiShield } from "react-icons/fi";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          {/* Hero Section */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-1 bg-[#ef4a23]" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#ef4a23] italic">Manifesto // The Core</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-[1000] text-[#081621] uppercase italic tracking-tighter leading-[0.9] mb-8">
              Engineered <br />
              To <span className="text-[#ef4a23]">Lead</span>.
            </h1>
            <p className="max-w-2xl text-[15px] font-bold text-[#081621]/60 uppercase tracking-tight leading-relaxed border-l-4 border-[#081621] pl-6">
              Velocity is not just a sports gear provider; we are a tactical deployment center for performance technology. 
              Our mission is to equip the world's most ambitious competitors with gear that transcends standard limitations.
            </p>
          </div>

          {/* Core Values Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              { 
                icon: FiTarget, 
                title: "Precision Engineering", 
                desc: "Every fiber, every seam, and every angle is calculated for maximum output. We don't believe in generic manufacturing." 
              },
              { 
                icon: FiAward, 
                title: "Elite Standards", 
                desc: "Our gear is subjected to rigorous structural stress tests that far exceed professional league requirements." 
              },
              { 
                icon: FiShield, 
                title: "Asset Integrity", 
                desc: "We prioritize the safety and longevity of your athletic assets through proprietary material science." 
              }
            ].map((item, i) => (
              <div key={i} className="p-10 bg-[#f8f8f8] border border-[#eee] hover:border-[#081621] transition-all">
                <div className="w-12 h-12 bg-[#081621] text-white flex items-center justify-center mb-8 rotate-45">
                  <item.icon size={20} className="-rotate-45" />
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">{item.title}</h3>
                <p className="text-[12px] font-bold text-[#081621]/40 uppercase tracking-wide leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl font-[1000] uppercase tracking-tighter mb-8 italic">Origins // <span className="text-[#ef4a23]">The Archive</span></h2>
              <div className="space-y-6 text-[14px] text-[#081621]/70 leading-relaxed font-medium">
                <p>
                  Founded in 2024, Velocity emerged from a necessity for high-density, performance-focused sports equipment in a market saturated with mass-produced alternatives. 
                </p>
                <p>
                  Based in Dhaka, we have quickly expanded our operations to become a global hub for sports tech. Our facility combines traditional craftsmanship with ballistic-grade material testing to ensure that when you take the field, you are backed by superior structural integrity.
                </p>
                <p>
                  Today, Velocity serves as the primary gear source for elite athletes across Cricket, Football, and Badminton. We continue to push the boundaries of what is possible in sports equipment deployment.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
               <div className="relative border-[16px] border-[#f8f8f8]">
                  <img 
                    src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop" 
                    alt="Velocity Facility" 
                    className="w-full grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-[#081621] text-white p-6 font-black italic text-[11px] uppercase tracking-[0.3em]">
                     Station.DHAKA
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
