"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import type { IBrand } from "@/types";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchBrands = async () => {
    const res = await fetch("/api/brands");
    const json = await res.json();
    if (json.success) setBrands(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Name is required"); return; }
    const method = editId ? "PUT" : "POST";
    const body = editId ? { _id: editId, ...form } : form;
    const res = await fetch("/api/brands", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.success) {
      toast.success(editId ? "Brand updated!" : "Brand created!");
      setModalOpen(false); setEditId(null); setForm({ name: "", slug: "", description: "" }); fetchBrands();
    } else toast.error(json.error || "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    const res = await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("Moved to recycle bin!"); fetchBrands(); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} brands?`)) return;
    const res = await fetch("/api/bulk", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", type: "brand", ids: Array.from(selectedIds) }) });
    const json = await res.json();
    if (json.success) { toast.success(json.message); setSelectedIds(new Set()); fetchBrands(); }
  };

  const toggleSelect = (id: string) => { const s = new Set(selectedIds); s.has(id) ? s.delete(id) : s.add(id); setSelectedIds(s); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Brands</h1>
          <p className="text-sm text-slate-500 mt-1">{brands.length} brands</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete} className="px-4 py-2.5 bg-red-500/10 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/20 cursor-pointer">
              <FiTrash2 className="inline mr-1" size={14} /> Delete ({selectedIds.size})
            </button>
          )}
          <Button onClick={() => { setEditId(null); setForm({ name: "", slug: "", description: "" }); setModalOpen(true); }}>
            <FiPlus className="mr-2" size={16} /> Add Brand
          </Button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-4 px-3 w-10">
                  <input type="checkbox" onChange={() => selectedIds.size === brands.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(brands.map(b => b._id)))}
                    checked={selectedIds.size === brands.length && brands.length > 0} className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-blue-600 cursor-pointer" />
                </th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Name</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Slug</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Description</th>
                <th className="py-4 px-5" />
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand._id} className={`border-b border-slate-800/50 hover:bg-slate-800/20 ${selectedIds.has(brand._id) ? "bg-blue-500/5" : ""}`}>
                  <td className="py-3 px-3">
                    <input type="checkbox" checked={selectedIds.has(brand._id)} onChange={() => toggleSelect(brand._id)}
                      className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-blue-600 cursor-pointer" />
                  </td>
                  <td className="py-3 px-5 text-white font-medium">{brand.name}</td>
                  <td className="py-3 px-5 text-slate-400">{brand.slug}</td>
                  <td className="py-3 px-5 text-slate-500 text-xs line-clamp-1">{brand.description || "—"}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditId(brand._id); setForm({ name: brand.name, slug: brand.slug || "", description: brand.description || "" }); setModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 cursor-pointer"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(brand._id)} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 cursor-pointer"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-slate-500">No brands yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Brand" : "Add Brand"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Brand Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required id="brand-name" />
          <Input label="Slug (URL)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="Auto-generated if left empty" id="brand-slug" />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brand description..."
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editId ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
