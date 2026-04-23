"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "01 // Data Collection",
      content: "Velocity Gear collects minimal operational data necessary for order deployment. This includes full name, delivery coordinates, contact identifiers, and equipment preferences. We do not aggregate data for tertiary marketing protocols."
    },
    {
      title: "02 // Tactical Security",
      content: "All sensitive data is encrypted using military-grade security protocols. We utilize secure socket layers (SSL) for all transit and do not store raw payment credentials on our primary servers."
    },
    {
      title: "03 // Third-Party Interfacing",
      content: "Data is shared only with certified logistics partners (Courier Services) to ensure successful gear deployment. We do not sell or lease your identity to external data harvesting entities."
    },
    {
      title: "04 // Cookies & Tracking",
      content: "Our system uses persistent and session cookies to maintain your gear manifest (cart) and ensure a seamless operational flow. You may disable these via your terminal settings, though it may degrade site performance."
    },
    {
      title: "05 // Your Rights",
      content: "You retain the absolute right to access, rectify, or purge your data from our archives at any time. Contact our support terminal to initiate these protocols."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header />
      <main className="pt-20 pb-32">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-1 bg-[#ef4a23]" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#ef4a23] italic">Protocol // Privacy</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-[1000] text-[#081621] uppercase italic tracking-tighter mb-16">
            Privacy <span className="text-[#ef4a23]">Directives</span>
          </h1>

          <div className="bg-white border border-[#eee] p-8 md:p-16 space-y-16">
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-xl font-black uppercase italic tracking-widest text-[#081621] border-b border-[#eee] pb-4">
                  {section.title}
                </h3>
                <p className="text-[14px] font-medium text-[#081621]/60 leading-relaxed uppercase tracking-wide">
                  {section.content}
                </p>
              </div>
            ))}

            <div className="pt-10 border-t border-[#eee] text-[11px] font-black text-[#081621]/30 uppercase tracking-[0.3em] italic">
              Last Updated: 2024.04.23 // Version 2.0.1
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
