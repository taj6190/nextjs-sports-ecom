"use client";

import { useState, useEffect, Fragment } from "react";
import Modal from "@/components/ui/Modal";
import { FiPlus, FiEdit2, FiTrash2, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";
import type { ICategory } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<(ICategory & { children?: ICategory[] })[]>([]);
  const [allCategories, setAllCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", parent: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchCategories = async () => {
    const [treeRes, allRes] = await Promise.all([
      fetch("/api/categories?tree=true").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]);
    if (treeRes.success) setCategories(treeRes.data);
    if (allRes.success) setAllCategories(allRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("DENIED: NAME REQUIRED"); return; }

    const method = editId ? "PUT" : "POST";
    const body = editId
      ? { _id: editId, name: form.name, slug: form.slug ? form.slug.toLowerCase().replace(/\s+/g, '-') : undefined, icon: form.icon, parent: form.parent || null }
      : { name: form.name, slug: form.slug ? form.slug.toLowerCase().replace(/\s+/g, '-') : undefined, icon: form.icon, parent: form.parent || null };

    const res = await fetch("/api/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (json.success) {
      toast.success(editId ? "DATABANK UPDATED" : "CLASSIFICATION ESTABLISHED");
      setModalOpen(false);
      setEditId(null);
      setForm({ name: "", slug: "", icon: "", parent: "" });
      fetchCategories();
    } else {
      toast.error(json.error || "OPERATION FAILED");
    }
  };

  const handleEdit = (cat: ICategory) => {
    setEditId(cat._id);
    setForm({
      name: cat.name,
      slug: cat.slug || "",
      icon: cat.icon || "",
      parent: (cat.parent as string) || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Purge classification?")) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("PURGE COMPLETE"); fetchCategories(); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Purge ${selectedIds.size} classifications?`)) return;
    const res = await fetch("/api/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", type: "category", ids: Array.from(selectedIds) }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success(json.message.toUpperCase());
      setSelectedIds(new Set());
      fetchCategories();
    }
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  const parentOptions = allCategories.filter(c => !c.parent && c._id !== editId);

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-[#ef4a23]" />
            <h2 className="text-[10px] font-black tracking-[0.4em] text-[#ef4a23] uppercase italic">System Taxonomy</h2>
           </div>
           <h1 className="text-3xl lg:text-4xl font-[1000] text-white tracking-tighter uppercase italic">
            Root <span className="text-white/20">Branches</span>
           </h1>
        </div>
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete}
              className="px-6 py-3 border border-red-500/30 text-red-500 text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-red-500/10 transition-colors cursor-pointer">
              <FiTrash2 className="inline mr-2" size={14} /> Purge ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={() => { setEditId(null); setForm({ name: "", slug: "", icon: "", parent: "" }); setModalOpen(true); }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-[#ef4a23] text-white text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-white hover:text-black transition-colors"
          >
            <FiPlus size={16} /> New Branch
          </button>
        </div>
      </div>

      <div className="bg-[#111119] border border-white/[0.06]">
        {loading ? (
          <div className="p-12 text-center text-[10px] font-black tracking-[0.4em] text-white/20 uppercase italic animate-pulse">Initializing Taxonomy Core...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="py-4 px-5 w-12">
                  <input type="checkbox" onChange={() => {
                    if (selectedIds.size === allCategories.length) setSelectedIds(new Set());
                    else setSelectedIds(new Set(allCategories.map(c => c._id)));
                  }} checked={selectedIds.size === allCategories.length && allCategories.length > 0}
                  className="w-4 h-4 appearance-none border border-white/20 bg-transparent checked:bg-[#ef4a23] checked:border-[#ef4a23] cursor-pointer" />
                </th>
                <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Ident</th>
                <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Designation</th>
                <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Class</th>
                <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Routing Slug</th>
                <th className="py-4 px-5" />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <Fragment key={cat._id}>
                  <tr key={cat._id} className={`border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors ${selectedIds.has(cat._id) ? "bg-[#ef4a23]/5" : ""}`}>
                    <td className="py-4 px-5">
                      <input type="checkbox" checked={selectedIds.has(cat._id)} onChange={() => toggleSelect(cat._id)}
                        className="w-4 h-4 appearance-none border border-white/20 bg-transparent checked:bg-[#ef4a23] checked:border-[#ef4a23] cursor-pointer" />
                    </td>
                    <td className="py-4 px-5 text-xl opacity-60 grayscale hover:grayscale-0 transition-all">{cat.icon || "📦"}</td>
                    <td className="py-4 px-5 font-black text-white text-[12px] uppercase italic tracking-widest">{cat.name}</td>
                    <td className="py-4 px-5"><span className="px-2 py-1 text-[9px] font-black tracking-widest uppercase italic border text-[#ef4a23] border-[#ef4a23]/30 bg-[#ef4a23]/10">Primary</span></td>
                    <td className="py-4 px-5 text-[10px] font-bold tracking-[0.1em] text-white/40 uppercase italic">{cat.slug}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(cat)} className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/40 hover:text-white hover:border-[#ef4a23] hover:bg-[#ef4a23] transition-colors">
                          <FiEdit2 size={12} />
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/40 hover:text-white hover:border-red-500 hover:bg-red-500 transition-colors">
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Sub-categories */}
                  {cat.children?.map((sub) => (
                    <tr key={sub._id} className={`border-b border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-colors ${selectedIds.has(sub._id) ? "bg-[#ef4a23]/5" : ""}`}>
                      <td className="py-3 px-5">
                        <input type="checkbox" checked={selectedIds.has(sub._id)} onChange={() => toggleSelect(sub._id)}
                          className="w-4 h-4 appearance-none border border-white/20 bg-transparent checked:bg-[#ef4a23] checked:border-[#ef4a23] cursor-pointer" />
                      </td>
                      <td className="py-3 px-5 pl-10 text-lg opacity-40 grayscale hover:grayscale-0 transition-all">
                        <FiChevronRight className="inline text-[#ef4a23] mr-2" size={14} />
                        {sub.icon || "📦"}
                      </td>
                      <td className="py-3 px-5 font-bold text-white/80 text-[11px] uppercase italic tracking-widest">{sub.name}</td>
                      <td className="py-3 px-5"><span className="px-2 py-1 text-[9px] font-black tracking-widest uppercase italic border text-white/60 border-white/20 bg-white/5">Sub-Branch</span></td>
                      <td className="py-3 px-5 text-[10px] font-bold tracking-[0.1em] text-white/30 uppercase italic">{sub.slug}</td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(sub)} className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/40 hover:text-white hover:border-[#ef4a23] hover:bg-[#ef4a23] transition-colors">
                            <FiEdit2 size={12} />
                          </button>
                          <button onClick={() => handleDelete(sub._id)} className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/40 hover:text-white hover:border-red-500 hover:bg-red-500 transition-colors">
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-[10px] font-black tracking-[0.4em] text-white/20 uppercase italic">Taxonomy Databank Empty</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Update Data" : "Initialize Link"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Designation *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-[12px] font-bold tracking-widest text-white uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Routing Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="AUTO-COMPILED"
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-[12px] font-bold tracking-widest text-white uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors placeholder:text-white/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Visual Ident (Emoji)</label>
            <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📱"
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-[16px] text-white focus:outline-none focus:border-[#ef4a23] transition-colors placeholder:text-white/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Parent Node</label>
            <select
              value={form.parent}
              onChange={(e) => setForm({ ...form, parent: e.target.value })}
              className="w-full px-4 py-3 bg-[#111119] border border-white/[0.06] text-[11px] font-bold tracking-widest text-white uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors appearance-none cursor-pointer"
            >
              <option value="">ROOT SECTOR</option>
              {parentOptions.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 pt-4 border-t border-white/[0.06]">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-3 border border-white/20 text-white/60 text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-white hover:text-black hover:border-white transition-colors">
              Abort
            </button>
            <button type="submit"
              className="flex-1 py-3 bg-[#ef4a23] text-white text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-white hover:text-black transition-colors">
              {editId ? "Commit" : "Initialize"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
