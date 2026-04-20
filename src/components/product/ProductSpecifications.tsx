"use client";

import type { ISpecificationGroup } from "@/types";

interface ProductSpecificationsProps {
  specifications: ISpecificationGroup[];
}

export default function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  if (!specifications || specifications.length === 0) return null;

  return (
    <div className="mt-10 bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-800">
        <h2 className="text-lg font-bold text-white tracking-wide">Specification</h2>
      </div>

      {/* Spec Groups */}
      <div className="divide-y divide-slate-200">
        {specifications.map((group, gIdx) => (
          <div key={gIdx}>
            {/* Group Header */}
            <div className="px-6 py-3 bg-slate-100 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{group.group}</h3>
            </div>

            {/* Key-Value Rows */}
            <div className="divide-y divide-slate-100">
              {group.items.map((item, iIdx) => (
                <div
                  key={iIdx}
                  className={`flex ${iIdx % 2 === 1 ? "bg-slate-50/50" : "bg-white"}`}
                >
                  <div className="w-[220px] sm:w-[280px] flex-shrink-0 px-6 py-3 text-sm text-slate-500 font-medium border-r border-slate-100">
                    {item.key}
                  </div>
                  <div className="flex-1 px-6 py-3 text-sm text-slate-800">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
