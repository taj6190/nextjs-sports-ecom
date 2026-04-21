import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { FiTarget, FiZap, FiAward, FiShield } from "react-icons/fi";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] font-sans text-[#111]">
      <Header />

      <main>
        {/* Hero Title Area */}
        <section className="bg-white pt-32 pb-20 border-b border-[#eee]">
           <div className="max-w-[1400px] mx-auto px-6 md:px-12">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-1 bg-[#ef4a23]" />
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#ef4a23] italic">Ref // Velocity Manifesto</span>
              </div>
              <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-[0.8] mb-12">
                 Engineered <br /> 
                 <span className="text-[#ef4a23]">To Defy.</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium text-[#444] leading-relaxed border-l-4 border-black pl-8">
                 Founded on the principles of ballistic performance and elite logistics, Velocity is the ultimate terminal 
                 for athletes who demand precision-engineered gear. We don't sell equipment; we distribute tactical advantages.
              </p>
           </div>
        </section>

        {/* Industrial Stats */}
        <section className="bg-[#081621] py-16 text-white overflow-hidden relative">
           <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#ef4a23] mb-2">// Active Gear</p>
                 <p className="text-4xl font-black italic">5,000+</p>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#ef4a23] mb-2">// Pro Athletes</p>
                 <p className="text-4xl font-black italic">120</p>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#ef4a23] mb-2">// Global Hubs</p>
                 <p className="text-4xl font-black italic">03</p>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#ef4a23] mb-2">// Uptime %</p>
                 <p className="text-4xl font-black italic">99.9</p>
              </div>
           </div>
        </section>

        {/* Core Pillars */}
        <section className="py-24 max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-1 px-1 mt-10">
           <div className="bg-white p-12 border border-[#eee]">
              <div className="w-12 h-12 bg-[#ef4a23] flex items-center justify-center text-white mb-8">
                 <FiTarget size={24} />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-6">Mission 01: Precision</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                 Our scouts and engineers vet every single SKU against rigorous performance benchmarks. 
                 If a cricket bat doesnt have the optimal center of gravity, it doesnt enter our vault. 
                 We optimize for the win, always.
              </p>
           </div>
           
           <div className="bg-white p-12 border border-[#eee]">
              <div className="w-12 h-12 bg-[#081621] flex items-center justify-center text-white mb-8">
                 <FiZap size={24} />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-6">Mission 02: Velocity</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                 Time is the ultimate competitor. Our state-of-the-art multi-hub logistics network ensures that 
                 from the moment you "Deploy" an item, our rapid-transit protocol is activated. 
                 No delays. Just deployment.
              </p>
           </div>
        </section>

        {/* Narrative Section */}
        <section className="bg-white py-32 border-y border-[#eee]">
           <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-12">The Velocity Origin</h2>
              <div className="space-y-8 text-left text-lg text-[#555] leading-relaxed">
                 <p>
                    Velocity was born in a garage in Dhaka, built by athletes who were tired of generic retailers 
                    who treated high-performance gear like common groceries. We saw a gap where professional 
                    technical knowledge met the distribution of elite sports equipment.
                 </p>
                 <p>
                    Today, Velocity serves as the primary terminal for serious competitors across the region. 
                    Whether you are opening the innings at Mirpur or hitting the winning smash at the national 
                    stadium, our mission is to ensure you have the best technical advantage money can buy.
                 </p>
              </div>
              <div className="mt-16 inline-flex items-center gap-6">
                 <div className="w-12 h-12 border-4 border-[#ef4a23]" />
                 <p className="text-[12px] font-black uppercase tracking-[0.2em]">Authorized Technical Distribution</p>
              </div>
           </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-[#F2F4F8] py-24">
           <div className="max-w-[1400px] mx-auto px-6 md:px-12 bg-[#081621] p-12 flex flex-col md:flex-row items-center justify-between text-white border-b-[10px] border-[#ef4a23]">
              <div className="mb-8 md:mb-0">
                 <h2 className="text-4xl font-black uppercase tracking-tighter italic">Join The Syndicate</h2>
                 <p className="text-slate-400 mt-2">Become part of an elite community of athletes.</p>
              </div>
              <button className="bg-[#ef4a23] px-12 py-5 font-black uppercase tracking-widest italic text-[14px] hover:bg-white hover:text-black transition-all">
                 Register Protocol
              </button>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
