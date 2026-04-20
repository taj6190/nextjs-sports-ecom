"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FiChevronDown, FiFilter, FiX } from "react-icons/fi";

interface CategoryTree {
  _id: string;
  name: string;
  icon?: string;
  children?: CategoryTree[];
}

interface Attribute {
  _id: string;
  name: string;
  values: string[];
}

export default function ProductFilters({
  categories,
  attributes,
  brands,
  variant = "both",
}: {
  categories: CategoryTree[];
  attributes: Attribute[];
  brands: string[];
  variant?: "mobile" | "desktop" | "both";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // By default, match StarTech: blocks are open.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    price: true,
    category: true,
    brand: true,
  });

  const toggle = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const [priceState, setPriceState] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });

  // Debounced price update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentMin = searchParams.get("minPrice") || "";
      const currentMax = searchParams.get("maxPrice") || "";

      if (priceState.min === currentMin && priceState.max === currentMax) return;

      const params = new URLSearchParams(searchParams.toString());
      if (priceState.min) params.set("minPrice", priceState.min);
      else params.delete("minPrice");

      if (priceState.max) params.set("maxPrice", priceState.max);
      else params.delete("maxPrice");

      params.delete("page");
      router.push(`/shop?${params.toString()}`, { scroll: false });
    }, 1000);
    return () => clearTimeout(timer);
  }, [priceState, searchParams, router]);

  // Handle external searchParams changes (e.g. Back button or Clear All)
  // But ONLY if they differ from local state to avoid overwriting user typing
  useEffect(() => {
    const urlMin = searchParams.get("minPrice") || "";
    const urlMax = searchParams.get("maxPrice") || "";
    if (urlMin !== priceState.min || urlMax !== priceState.max) {
      // If we're not actively typing (this is harder to detect, so we just check if URL is strictly different)
      // Actually, if the user cleared filters, we should sync.
      if (!urlMin && !urlMax && (priceState.min || priceState.max)) {
        setPriceState({ min: "", max: "" });
      }
    }
  }, [searchParams]);

  const handleCheckbox = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const hasFilters =
    searchParams.get("category") || searchParams.get("brand") || searchParams.get("minPrice") || searchParams.get("maxPrice");

  // Exact StarTech individual block component
  const FilterBlock = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
    <div className="bg-white shadow-[0_1px_1px_rgba(0,0,0,0.1)] border border-[#eee] mb-4">
      <button 
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-[#eee] hover:text-[#ef4a23] transition-colors"
      >
        <h3 className="text-[15px] font-bold text-[#111] uppercase tracking-wide">{title}</h3>
        <FiChevronDown className={`text-[#666] transition-transform ${expanded[id] ? "rotate-180" : ""}`} />
      </button>
      {expanded[id] && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );

  const content = (
    <div className="w-full">
      {/* ── Price Block ── */}
      <FilterBlock title="Price Range" id="price">
        <div className="relative pt-2 pb-6">
          <input 
            type="range" 
            min="0" 
            max="500000" 
            className="w-full h-1 bg-[#ddd] rounded-none outline-none appearance-none accent-[#ef4a23] cursor-pointer"
            onChange={(e) => setPriceState((p) => ({ ...p, max: e.target.value }))}
            value={priceState.max || 500000}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="0"
            value={priceState.min}
            onChange={(e) => setPriceState((p) => ({ ...p, min: e.target.value }))}
            className="w-full h-9 px-3 border border-[#ddd] text-[13px] font-bold text-[#333] outline-none focus:border-[#ef4a23] transition-colors"
          />
          <span className="text-[#888] font-bold">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceState.max}
            onChange={(e) => setPriceState((p) => ({ ...p, max: e.target.value }))}
            className="w-full h-9 px-3 border border-[#ddd] text-[13px] font-bold text-[#333] outline-none focus:border-[#ef4a23] transition-colors"
          />
        </div>
      </FilterBlock>

      {/* ── Categories Block ── */}
      {categories.length > 0 && (
        <FilterBlock title="Category" id="category">
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {categories.map((c) => (
              <label
                key={c._id}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div className="relative flex items-center justify-center pt-[1px]">
                  <input
                    type="checkbox"
                    checked={searchParams.get("category") === c._id}
                    onChange={() => handleCheckbox("category", c._id)}
                    className="peer sr-only"
                  />
                  <div className="w-[15px] h-[15px] border border-[#ccc] bg-white peer-checked:bg-[#ef4a23] peer-checked:border-[#ef4a23] transition-all" />
                  <svg
                    className="absolute w-[10px] h-[10px] text-white opacity-0 peer-checked:opacity-100 top-[4px] left-[2.5px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[14px] text-[#444] group-hover:text-[#ef4a23] select-none leading-tight transition-colors">
                  {c.name}
                </span>
              </label>
            ))}
          </div>
        </FilterBlock>
      )}

      {/* ── Brands Block ── */}
      {brands.length > 0 && (
        <FilterBlock title="Brand" id="brand">
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {brands.map((b) => (
              <label
                key={b}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div className="relative flex items-center justify-center pt-[1px]">
                  <input
                    type="checkbox"
                    checked={searchParams.get("brand") === b}
                    onChange={() => handleCheckbox("brand", b)}
                    className="peer sr-only"
                  />
                  <div className="w-[15px] h-[15px] border border-[#ccc] bg-white peer-checked:bg-[#ef4a23] peer-checked:border-[#ef4a23] transition-all" />
                  <svg
                    className="absolute w-[10px] h-[10px] text-white opacity-0 peer-checked:opacity-100 top-[4px] left-[2.5px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[14px] text-[#444] group-hover:text-[#ef4a23] select-none leading-tight transition-colors">
                  {b}
                </span>
              </label>
            ))}
          </div>
        </FilterBlock>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      {(variant === "both" || variant === "mobile") && (
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center gap-2 px-4 h-8 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[13px] font-medium transition-colors"
        >
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path></svg>
          Filter
        </button>
      )}

      {/* Desktop Filters */}
      {(variant === "both" || variant === "desktop") && (
        <div className="w-full">
          {content}
        </div>
      )}

      {/* Mobile Filters Drawer */}
      <div 
        className={`fixed inset-0 z-[60] flex transition-all duration-300 ease-in-out ${mobileOpen ? "visible" : "invisible pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        
        {/* Drawer Content */}
        <div 
          className={`relative w-[300px] max-w-[85vw] bg-[#f2f4f8] h-full flex flex-col pt-0 shadow-2xl transition-transform duration-300 ease-in-out transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-[#ddd]">
            <span className="text-[16px] font-bold text-[#111] uppercase tracking-wide">
              Filters
            </span>
            <button 
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 flex items-center justify-center border border-[#ddd] bg-[#f9f9f9] text-[#666] hover:bg-[#ef4a23] hover:text-white hover:border-[#ef4a23] transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
             {content}
          </div>

          {/* Sticky Bottom Actions */}
          {hasFilters && (
            <div className="p-4 bg-white border-t border-[#ddd] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button
                onClick={() => {
                  setPriceState({ min: "", max: "" });
                  router.push("/shop");
                  setMobileOpen(false);
                }}
                className="w-full py-3 bg-[#e4173e] hover:bg-[#c91232] text-white font-bold text-[13px] uppercase tracking-wider transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
