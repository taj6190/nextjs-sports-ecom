"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
  const rules = [
    {
      id: "01",
      title: "Engagement Agreement",
      text: "By accessing the Velocity Gear terminal, you agree to comply with our operational standards. All transactions are subject to gear availability and verification of deployment coordinates."
    },
    {
      id: "02",
      title: "Asset Pricing",
      text: "We reserve the right to adjust asset pricing without prior notification. In the event of a system-wide pricing error, we reserve the right to neutralize orders before shipment."
    },
    {
      id: "03",
      title: "User Conduct",
      text: "Any attempt to bypass security protocols or scrape data from the Velocity Matrix will result in immediate terminal blacklisting and potential legal action."
    },
    {
      id: "04",
      title: "Intellectual Property",
      text: "All designs, code, and tactical imagery are the sole property of Velocity Gear. Unauthorized reproduction is strictly prohibited under global copyright directives."
    },
    {
      id: "05",
      title: "Liability Limitation",
      text: "Velocity is not liable for indirect damages resulting from gear usage. Users assume all risk during athletic engagement and equipment deployment."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20 pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
              <div className="sticky top-28">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-12 h-1 bg-[#081621]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#081621] italic">Directives // Terms</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-[1000] text-[#081621] uppercase italic tracking-tighter leading-none mb-8">
                  Terms of <br />
                  <span className="text-[#ef4a23]">Service</span>
                </h1>
                <p className="text-[13px] font-bold text-[#081621]/50 uppercase tracking-widest leading-relaxed max-w-sm">
                  Operational guidelines for all users within the Velocity Gear ecosystem. Please review these protocols carefully before engagement.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-12">
              {rules.map((rule) => (
                <div key={rule.id} className="group relative pl-16">
                   <span className="absolute left-0 top-0 text-3xl font-black italic text-[#ef4a23]/20 group-hover:text-[#ef4a23] transition-colors">{rule.id}</span>
                   <h3 className="text-xl font-[1000] uppercase tracking-tighter mb-4 italic">{rule.title}</h3>
                   <p className="text-[14px] font-medium text-[#081621]/70 leading-relaxed uppercase tracking-wide">
                     {rule.text}
                   </p>
                </div>
              ))}
              
              <div className="pt-10 border-t border-[#eee] text-[10px] font-black text-[#081621]/20 uppercase tracking-[0.4em] italic">
                 Velocity Global Directives 2024
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
