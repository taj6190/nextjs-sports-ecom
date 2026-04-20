"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
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
    // Fetch all deals (including expired) for admin
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
      toast.error("All fields are required"); return;
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
      toast.success(editId ? "Deal updated!" : "Deal created!");
      setModalOpen(false); setEditId(null); setForm({ product: "", dealPrice: "", originalPrice: "", startTime: "", endTime: "" });
      fetchDeals();
    } else toast.error(json.error || "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this deal?")) return;
    const res = await fetch(`/api/deals?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("Deal deleted!"); fetchDeals(); }
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p._id === productId);
    setForm(f => ({
      ...f,
      product: productId,
      originalPrice: product ? product.basePrice.toString() : f.originalPrice,
    }));
  };

  // Quick presets
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiOutlineFire className="text-orange-400" /> Today&apos;s Deals
          </h1>
          <p className="text-sm text-slate-500 mt-1">{deals.length} active deals</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm({ product: "", dealPrice: "", originalPrice: "", startTime: "", endTime: "" }); setModalOpen(true); }}>
          <FiPlus className="mr-2" size={16} /> Create Deal
        </Button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Product</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Deal Price</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Original</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Discount</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Ends</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Status</th>
                  <th className="py-4 px-5" />
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => {
                  const discount = Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100);
                  const expired = isExpired(deal.endTime);
                  return (
                    <tr key={deal._id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                      <td className="py-3 px-5 text-white font-medium">{deal.product?.name || "—"}</td>
                      <td className="py-3 px-5 text-orange-400 font-bold">{formatPrice(deal.dealPrice)}</td>
                      <td className="py-3 px-5 text-slate-500 line-through">{formatPrice(deal.originalPrice)}</td>
                      <td className="py-3 px-5"><Badge variant="danger">-{discount}%</Badge></td>
                      <td className="py-3 px-5 text-slate-400 text-xs">{new Date(deal.endTime).toLocaleString()}</td>
                      <td className="py-3 px-5">
                        <Badge variant={expired ? "warning" : "success"}>{expired ? "Expired" : "Active"}</Badge>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => { setEditId(deal._id); setForm({ product: deal.product._id, dealPrice: deal.dealPrice.toString(), originalPrice: deal.originalPrice.toString(), startTime: deal.startTime.slice(0, 16), endTime: deal.endTime.slice(0, 16) }); setModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 cursor-pointer"><FiEdit2 size={14} /></button>
                          <button onClick={() => handleDelete(deal._id)} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 cursor-pointer"><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {deals.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-slate-500">No deals yet. Create one!</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Deal" : "Create Today's Deal"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Product *</label>
            <select value={form.product} onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
              <option value="">Select product</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} ({formatPrice(p.basePrice)})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Deal Price (৳) *" type="number" value={form.dealPrice} onChange={(e) => setForm({ ...form, dealPrice: e.target.value })} id="deal-price" />
            <Input label="Original Price (৳) *" type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} id="deal-original" />
          </div>

          {/* Quick Duration Presets */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Quick Duration</label>
            <div className="flex gap-2">
              {[{ label: "6 Hours", h: 6 }, { label: "12 Hours", h: 12 }, { label: "24 Hours", h: 24 }, { label: "48 Hours", h: 48 }].map(p => (
                <button key={p.h} type="button" onClick={() => setDuration(p.h)}
                  className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 text-slate-300 text-xs rounded-lg hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time *" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} id="deal-start" />
            <Input label="End Time *" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} id="deal-end" />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editId ? "Update" : "Create Deal"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
