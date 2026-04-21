"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { FiChevronDown, FiX, FiCheck, FiFilter } from "react-icons/fi";

interface CategoryTree {
  _id: string;
  name: string;
  children?: CategoryTree[];
}

interface Attribute {
  _id: string;
  name: string;
  values: string[];
}

export default function ProductFilters({
  categories,
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
  
  // Local state for filters to avoid auto-calling API
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "");
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get("brand") || "");
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });

  // Sync with URL when it changes (e.g. browser back button or clear filters)
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedBrand(searchParams.get("brand") || "");
    setPriceRange({
      min: searchParams.get("minPrice") || "",
      max: searchParams.get("maxPrice") || "",
    });
  }, [searchParams]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    price: true,
    category: true,
    brand: true,
  });

  const toggle = (key: string) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");

    if (selectedBrand) params.set("brand", selectedBrand);
    else params.delete("brand");

    if (priceRange.min) params.set("minPrice", priceRange.min);
    else params.delete("minPrice");

    if (priceRange.max) params.set("maxPrice", priceRange.max);
    else params.delete("maxPrice");

    params.delete("page"); // Reset page on filter change
    router.push(`/shop?${params.toString()}`, { scroll: false });
    setMobileOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange({ min: "", max: "" });
    router.push("/shop");
    setMobileOpen(false);
  };

  const isDirty = useMemo(() => {
    return (
      selectedCategory !== (searchParams.get("category") || "") ||
      selectedBrand !== (searchParams.get("brand") || "") ||
      priceRange.min !== (searchParams.get("minPrice") || "") ||
      priceRange.max !== (searchParams.get("maxPrice") || "")
    );
  }, [selectedCategory, selectedBrand, priceRange, searchParams]);

  const FilterBlock = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
    <div className="bg-white shadow-sm border border-[#eee] mb-4 overflow-hidden rounded-md">
      <button 
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fa] border-b border-[#eee] hover:text-[#ef4a23] transition-colors"
      >
        <h3 className="text-[14px] font-bold text-[#111] uppercase tracking-wider">{title}</h3>
        <FiChevronDown className={`text-[#888] transition-transform duration-300 ${expanded[id] ? "rotate-180" : ""}`} />
      </button>
      {expanded[id] && (
        <div className="p-4 bg-white animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );

  const renderCategory = (cat: CategoryTree, depth = 0) => {
    const isSelected = selectedCategory === cat._id;
    return (
      <div key={cat._id} className="w-full">
        <label className={`flex items-center gap-2 py-1.5 cursor-pointer group transition-all`}>
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => setSelectedCategory(isSelected ? "" : cat._id)}
              className="peer sr-only"
            />
            <div className={`w-[16px] h-[16px] border ${isSelected ? "bg-[#ef4a23] border-[#ef4a23]" : "bg-white border-[#ccc]"} group-hover:border-[#ef4a23] flex items-center justify-center transition-all`}>
              {isSelected && <FiCheck className="text-white" size={12} />}
            </div>
          </div>
          <span className={`text-[13px] ${isSelected ? "text-[#ef4a23] font-bold" : "text-[#555]"} group-hover:text-[#ef4a23] transition-colors`} style={{ marginLeft: depth * 12 }}>
            {cat.name}
          </span>
        </label>
        {cat.children && cat.children.length > 0 && (
          <div className="border-l border-slate-100 ml-2">
            {cat.children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div className="w-full">
      {/* ── Action Bar — Sticky if dirty ── */}
      <div className={`mb-4 flex flex-col gap-2 transition-all duration-300 overflow-hidden ${isDirty || searchParams.toString() ? "max-h-32" : "max-h-0"}`}>
        <button
          onClick={applyFilters}
          className="w-full h-10 bg-[#ef4a23] text-white text-[13px] font-bold uppercase tracking-widest hover:bg-[#d03d1c] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          Apply Filters
        </button>
        {searchParams.toString() && (
          <button
            onClick={clearFilters}
            className="w-full h-10 border border-[#ef4a23] text-[#ef4a23] text-[13px] font-bold uppercase tracking-widest hover:bg-[#ef4a23] hover:text-white transition-all shadow-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Price Block ── */}
      <FilterBlock title="Price Range" id="price">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-[10px] text-[#888] uppercase block mb-1">Min</span>
              <input
                type="number"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                className="w-full h-9 px-3 border border-[#ddd] text-[13px] font-bold text-[#333] outline-none focus:border-[#ef4a23] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <span className="text-[#888] pt-4 font-bold">-</span>
            <div className="flex-1">
              <span className="text-[10px] text-[#888] uppercase block mb-1">Max</span>
              <input
                type="number"
                placeholder="ANY"
                value={priceRange.max}
                onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                className="w-full h-9 px-3 border border-[#ddd] text-[13px] font-bold text-[#333] outline-none focus:border-[#ef4a23] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>
          <input 
            type="range" 
            min="0" 
            max="200000" 
            step="1000"
            className="w-full h-1 bg-[#eee] rounded-full outline-none appearance-none accent-[#ef4a23] cursor-pointer"
            onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
            value={priceRange.max || 200000}
          />
        </div>
      </FilterBlock>

      {/* ── Categories Block ── */}
      {categories.length > 0 && (
        <FilterBlock title="Category" id="category">
          <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar pr-2">
            {categories.map((c) => renderCategory(c))}
          </div>
        </FilterBlock>
      )}

      {/* ── Brands Block ── */}
      {brands.length > 0 && (
        <FilterBlock title="Brand" id="brand">
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {brands.map((b) => {
              const isSelected = selectedBrand === b;
              return (
                <label key={b} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => setSelectedBrand(isSelected ? "" : b)}
                      className="peer sr-only"
                    />
                    <div className={`w-[16px] h-[16px] border ${isSelected ? "bg-[#ef4a23] border-[#ef4a23]" : "bg-white border-[#ccc]"} group-hover:border-[#ef4a23] flex items-center justify-center transition-all`}>
                      {isSelected && <FiCheck className="text-white" size={12} />}
                    </div>
                  </div>
                  <span className={`text-[13px] ${isSelected ? "text-[#ef4a23] font-bold" : "text-[#555]"} group-hover:text-[#ef4a23] transition-colors`}>
                    {b}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterBlock>
      )}
    </div>
  );

  return (
    <>
      {(variant === "both" || variant === "mobile") && (
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center gap-2 px-4 h-8 bg-white border border-[#eee] hover:bg-slate-50 text-slate-800 rounded-md text-[13px] font-bold transition-all shadow-sm"
        >
          <FiFilter size={15} className="text-[#ef4a23]" />
          Filter
        </button>
      )}

      {(variant === "both" || variant === "desktop") && (
        <div className="w-full">
          {content}
        </div>
      )}

      {/* Mobile Filters Drawer */}
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${mobileOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileOpen(false)} />
        <div className={`absolute left-0 top-0 h-full w-[280px] bg-[#f2f4f8] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="h-14 bg-[#081621] flex items-center justify-between px-4">
            <h2 className="text-white font-bold uppercase tracking-wider text-[14px]">Filter Products</h2>
            <button onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-white"><FiX size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {content}
          </div>
          {(isDirty || searchParams.toString()) && (
            <div className="p-4 bg-white border-t border-[#ddd] space-y-2">
               <button onClick={applyFilters} className="w-full py-3 bg-[#ef4a23] text-white font-bold uppercase text-[13px]">Apply Filters</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
