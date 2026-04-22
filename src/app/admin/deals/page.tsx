"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { formatPrice } from "@/lib/utils";
import { FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi2";
import toast from "react-hot-toast";

interface Deal {
  _id: string;
  product: { _id: string; name: string; slug: string; basePrice: number; images: { url: string }[] };
  dealPrice: number;
  originalPrice: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface ProductOption {
  _id: string;
  name: string;
  basePrice: number;
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    product: "",
    dealPrice: "",
    originalPrice: "",
    startTime: "",
    endTime: "",
  });

  const fetchDeals = async () => {
    const res = await fetch("/api/deals");
    const json = await res.json();
    if (json.success) setDeals(json.data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await fetch("/api/products?limit=100");
    const json = await res.json();
    if (json.success) setProducts(json.data.map((p: { _id: string; name: string; basePrice: number }) => ({ _id: p._id, name: p.name, basePrice: p.basePrice })));
  };

  useEffect(() => { fetchDeals(); fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product || !form.dealPrice || !form.startTime || !form.endTime) {
      toast.error("ALL PARAMETERS REQUIRED"); return;
    }

    const method = editId ? "PUT" : "POST";
    const body = {
      ...(editId ? { _id: editId } : {}),
      product: form.product,
      dealPrice: parseFloat(form.dealPrice),
      originalPrice: parseFloat(form.originalPrice),
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      isActive: true,
    };

    const res = await fetch("/api/deals", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.success) {
      toast.success(editId ? "OVERRIDE UPDATED" : "OVERRIDE INITIALIZED");
      setModalOpen(false); setEditId(null); setForm({ product: "", dealPrice: "", originalPrice: "", startTime: "", endTime: "" });
      fetchDeals();
    } else toast.error(json.error || "OPERATION FAILED");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Purge price override protocol?")) return;
    const res = await fetch(`/api/deals?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("OVERRIDE PURGED"); fetchDeals(); }
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p._id === productId);
    setForm(f => ({
      ...f,
      product: productId,
      originalPrice: product ? product.basePrice.toString() : f.originalPrice,
    }));
  };

  const setDuration = (hours: number) => {
    const now = new Date();
    const end = new Date(now.getTime() + hours * 60 * 60 * 1000);
    setForm(f => ({
      ...f,
      startTime: now.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
    }));
  };

  const isExpired = (endTime: string) => new Date(endTime) < new Date();

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-[#ef4a23]" />
            <h2 className="text-[10px] font-black tracking-[0.4em] text-[#ef4a23] uppercase italic">Flash Protocol</h2>
           </div>
           <h1 className="text-3xl lg:text-4xl font-[1000] text-white tracking-tighter uppercase italic">
            Active <span className="text-white/20">Overrides</span>
           </h1>
        </div>
        <button 
          onClick={() => { setEditId(null); setForm({ product: "", dealPrice: "", originalPrice: "", startTime: "", endTime: "" }); setModalOpen(true); }}
          className="inline-flex items-center gap-3 px-6 py-3 bg-[#ef4a23] text-white text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-white hover:text-black transition-colors"
        >
          <FiPlus size={16} /> Init Override
        </button>
      </div>

      <div className="bg-[#111119] border border-white/[0.06]">
        {loading ? <div className="p-12 text-center text-[10px] font-black tracking-[0.4em] text-white/20 uppercase italic animate-pulse">Initializing Data Stream...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Asset Ident</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Override Value</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Base Value</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Deficit</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Termination Time</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Status</th>
                  <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => {
                  const discount = Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100);
                  const expired = isExpired(deal.endTime);
                  return (
                    <tr key={deal._id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-black text-white text-[12px] uppercase italic tracking-widest">{deal.product?.name || "—"}</td>
                      <td className="py-4 px-5 text-[14px] font-black text-[#ef4a23] italic tracking-wider">{formatPrice(deal.dealPrice)}</td>
                      <td className="py-4 px-5 text-[12px] font-bold text-white/30 italic line-through tracking-widest">{formatPrice(deal.originalPrice)}</td>
                      <td className="py-4 px-5">
                         <span className="px-2 py-1 text-[9px] font-black tracking-widest uppercase italic border text-amber-500 border-amber-500/30 bg-amber-500/10">-{discount}%</span>
                      </td>
                      <td className="py-4 px-5 text-[10px] font-bold tracking-[0.1em] text-white/40 uppercase italic">{new Date(deal.endTime).toLocaleString()}</td>
                      <td className="py-4 px-5">
                         <span className={`px-2 py-1 text-[9px] font-black tracking-widest uppercase italic border ${expired ? "text-red-500 border-red-500/30 bg-red-500/10" : "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"}`}>
                           {expired ? "TERMINATED" : "ACTIVE"}
                         </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditId(deal._id); setForm({ product: deal.product._id, dealPrice: deal.dealPrice.toString(), originalPrice: deal.originalPrice.toString(), startTime: deal.startTime.slice(0, 16), endTime: deal.endTime.slice(0, 16) }); setModalOpen(true); }}
                            className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/40 hover:text-white hover:border-[#ef4a23] hover:bg-[#ef4a23] transition-colors">
                            <FiEdit2 size={12} />
                          </button>
                          <button onClick={() => handleDelete(deal._id)} 
                            className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/40 hover:text-white hover:border-red-500 hover:bg-red-500 transition-colors">
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {deals.length === 0 && <tr><td colSpan={7} className="py-16 text-center text-[10px] font-black tracking-[0.4em] text-white/20 uppercase italic">No Active Protocols</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Update Protocol" : "Init Override Protocol"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Asset *</label>
            <select value={form.product} onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-4 py-3 bg-[#111119] border border-white/[0.06] text-[11px] font-bold tracking-widest text-white uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors appearance-none cursor-pointer">
              <option value="">SELECT ASSET</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} ({formatPrice(p.basePrice)})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Override Ratio (৳) *</label>
               <input type="number" value={form.dealPrice} onChange={(e) => setForm({ ...form, dealPrice: e.target.value })}
                 className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-[12px] font-bold tracking-widest text-white uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Base Value (৳) *</label>
               <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                 className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-[12px] font-bold tracking-widest text-white/50 uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors" />
             </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Quick Timers</label>
            <div className="flex gap-2">
              {[{ label: "6 HRS", h: 6 }, { label: "12 HRS", h: 12 }, { label: "24 HRS", h: 24 }, { label: "48 HRS", h: 48 }].map(p => (
                <button key={p.h} type="button" onClick={() => setDuration(p.h)}
                  className="flex-1 py-2 bg-white/[0.02] border border-white/[0.06] text-white/60 text-[9px] font-black tracking-widest uppercase italic hover:border-[#ef4a23] hover:text-[#ef4a23] hover:bg-[#ef4a23]/10 transition-all cursor-pointer">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Init Time TO</label>
               <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                 className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-[12px] font-bold tracking-widest text-white uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Term Time T1</label>
               <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                 className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-[12px] font-bold tracking-widest text-white uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors" />
             </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/[0.06]">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-3 border border-white/20 text-white/60 text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-white hover:text-black hover:border-white transition-colors">
              Abort
            </button>
            <button type="submit"
              className="flex-1 py-3 bg-[#ef4a23] text-white text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-white hover:text-black transition-colors">
              {editId ? "Commit Override" : "Init Override"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
