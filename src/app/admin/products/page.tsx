"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiStar, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import type { IProduct } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const fetchProducts = async () => {
    const res = await fetch("/api/products?limit=100");
    const json = await res.json();
    if (json.success) setProducts(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p._id)));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) { toast.error("No units selected"); return; }
    if (action === "delete" && !confirm(`Purge ${selectedIds.size} tactical units?`)) return;

    setBulkLoading(true);
    try {
      const res = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, type: "product", ids: Array.from(selectedIds) }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message.toUpperCase());
        setSelectedIds(new Set());
        fetchProducts();
      } else {
        toast.error(json.error || "OPERATION FAILED");
      }
    } catch {
      toast.error("COMMUNICATION ERROR");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Purge asset from active roster?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("ASSET PURGED"); fetchProducts(); }
    else toast.error(json.error || "OPERATION FAILED");
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-[#ef4a23]" />
            <h2 className="text-[10px] font-black tracking-[0.4em] text-[#ef4a23] uppercase italic">Inventory Systems</h2>
           </div>
           <h1 className="text-3xl lg:text-4xl font-[1000] text-white tracking-tighter uppercase italic">
            Active <span className="text-white/20">Assets</span>
           </h1>
        </div>
        
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-3 px-6 py-3 bg-[#ef4a23] text-white text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-white hover:text-black transition-colors"
        >
          <FiPlus size={16} /> Deploy New Asset
        </Link>
      </div>

      {/* Control Panel */}
      <div className="bg-[#111119] border border-white/[0.06] p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            placeholder="SCAN ASSETS..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] text-[11px] font-bold tracking-[0.2em] text-white placeholder-white/30 uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors"
          />
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap bg-white/[0.02] border border-white/[0.06] px-4 py-2">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#ef4a23] uppercase italic mr-2">{selectedIds.size} Selected</span>
            <button onClick={() => handleBulkAction("activate")} disabled={bulkLoading}
              className="px-3 py-2 border border-emerald-500/30 text-emerald-500 text-[9px] font-black tracking-widest uppercase italic hover:bg-emerald-500/10 transition-colors disabled:opacity-50">
              <FiCheck className="inline mr-1" size={10} /> Active
            </button>
            <button onClick={() => handleBulkAction("deactivate")} disabled={bulkLoading}
              className="px-3 py-2 border border-white/20 text-white/60 text-[9px] font-black tracking-widest uppercase italic hover:bg-white/5 transition-colors disabled:opacity-50">
              <FiX className="inline mr-1" size={10} /> Standby
            </button>
            <button onClick={() => handleBulkAction("feature")} disabled={bulkLoading}
              className="px-3 py-2 border border-amber-500/30 text-amber-500 text-[9px] font-black tracking-widest uppercase italic hover:bg-amber-500/10 transition-colors disabled:opacity-50">
              <FiStar className="inline mr-1" size={10} /> Feature
            </button>
            <button onClick={() => handleBulkAction("delete")} disabled={bulkLoading}
              className="px-3 py-2 border border-red-500/30 text-red-500 text-[9px] font-black tracking-widest uppercase italic hover:bg-red-500/10 transition-colors disabled:opacity-50">
              <FiTrash2 className="inline mr-1" size={10} /> Purge
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 text-white/40 text-[9px] font-black tracking-widest uppercase italic hover:text-white transition-colors">
              Abort
            </button>
          </div>
        )}
      </div>

      {/* Asset Matrix */}
      <div className="bg-[#111119] border border-white/[0.06]">
        {loading ? (
          <div className="p-12 text-center text-[10px] font-black tracking-[0.4em] text-white/20 uppercase italic animate-pulse">Initializing Matrix...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="py-4 px-5 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 appearance-none border border-white/20 bg-transparent checked:bg-[#ef4a23] checked:border-[#ef4a23] cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Asset Ident</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Classification</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Quote</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Status</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Intel</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic text-right">Commands</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className={`border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors ${selectedIds.has(product._id) ? "bg-[#ef4a23]/5" : ""}`}>
                    <td className="py-4 px-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="w-4 h-4 appearance-none border border-white/20 bg-transparent checked:bg-[#ef4a23] checked:border-[#ef4a23] cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/[0.04] border border-white/10 shrink-0">
                          {product.images?.[0]?.url ? (
                            <Image src={product.images[0].url} alt={product.name} width={48} height={48} className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-[9px] font-black uppercase tracking-widest italic">N/A</div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-white text-[12px] uppercase italic tracking-wider leading-tight">{product.name}</p>
                          <p className="text-[10px] font-bold tracking-[0.2em] text-[#ef4a23] uppercase italic mt-1">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-[11px] font-bold text-white/60 tracking-widest uppercase italic">
                         {typeof product.category === "object" && product.category ? (product.category as { name: string }).name : "—"}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                       <span className="text-[13px] font-black text-white italic tracking-wider">{formatPrice(product.basePrice)}</span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-2 items-start">
                         <span className={`px-2 py-1 text-[9px] font-black tracking-widest uppercase italic border ${product.totalStock === 0 ? 'text-red-500 border-red-500/30 bg-red-500/10' : product.totalStock <= 5 ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'}`}>
                           {product.totalStock} IN STOCK
                         </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex gap-2">
                         <span className={`w-2 h-2 rounded-full ${product.isActive ? "bg-emerald-500" : "bg-red-500"}`} title={product.isActive ? "Active" : "Inactive"} />
                         {product.isFeatured && <span className="w-2 h-2 rounded-full bg-amber-500" title="Featured" />}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product._id}/edit`}
                          className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/40 hover:text-white hover:border-[#ef4a23] hover:bg-[#ef4a23] transition-colors">
                          <FiEdit2 size={12} />
                        </Link>
                        <button onClick={() => handleDelete(product._id)}
                          className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/40 hover:text-white hover:border-red-500 hover:bg-red-500 transition-colors">
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                       <span className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase italic">
                         {searchFilter ? "No signals detected." : "Database empty."}
                       </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
