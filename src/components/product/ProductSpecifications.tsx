"use client";

import type { ISpecificationGroup } from "@/types";

interface ProductSpecificationsProps {
  specifications: ISpecificationGroup[];
}

export default function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  if (!specifications || specifications.length === 0) return null;

  return (
    <div className="mt-16 bg-white border border-[#eee] shadow-[0_10px_30px_rgba(0,0,0,0.03)] outline outline-1 outline-[#eee]">
      {/* Header */}
      <div className="px-6 py-5 bg-[#081621] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-full bg-[#ef4a23] skew-x-[-25deg] translate-x-12 opacity-80" />
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter relative z-10 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-[#ef4a23]" />
          Technical Specs
        </h2>
      </div>

      {/* Spec Groups */}
      <div className="divide-y divide-[#eee]">
        {specifications.map((group, gIdx) => (
          <div key={gIdx} className="group">
            {/* Group Header */}
            <div className="px-6 py-3 bg-[#f8f9fa] border-b border-[#eee] group-hover:bg-[#f0f1f3] transition-colors">
              <h3 className="text-[13px] font-black text-[#ef4a23] uppercase italic tracking-[0.1em]">
                // {group.group}
              </h3>
            </div>

            {/* Key-Value Rows */}
            <div className="divide-y divide-[#f1f1f1]">
              {group.items.map((item, iIdx) => (
                <div
                  key={iIdx}
                  className="flex flex-col sm:flex-row hover:bg-slate-50 transition-colors"
                >
                  <div className="sm:w-[300px] flex-shrink-0 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#666] border-b sm:border-b-0 sm:border-r border-[#eee] bg-[#fafafa]">
                    {item.key}
                  </div>
                  <div className="flex-1 px-6 py-3 text-[13px] font-medium text-[#111] leading-relaxed">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer decorative line */}
      <div className="h-1 bg-gradient-to-r from-[#ef4a23] to-[#081621]" />
    </div>
  );
}

