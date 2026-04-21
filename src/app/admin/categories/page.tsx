"use client";

import { useState, useEffect, Fragment } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
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
    if (!form.name) { toast.error("Name is required"); return; }

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
      toast.success(editId ? "Category updated!" : "Category created!");
      setModalOpen(false);
      setEditId(null);
      setForm({ name: "", slug: "", icon: "", parent: "" });
      fetchCategories();
    } else {
      toast.error(json.error || "Failed");
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
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("Moved to recycle bin!"); fetchCategories(); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} categories?`)) return;
    const res = await fetch("/api/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", type: "category", ids: Array.from(selectedIds) }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success(json.message);
      setSelectedIds(new Set());
      fetchCategories();
    }
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  // Get parent-level categories for the parent selector (exclude editing category)
  const parentOptions = allCategories.filter(c => !c.parent && c._id !== editId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">{allCategories.length} categories</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete}
              className="px-4 py-2.5 bg-red-500/10 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/20 transition-all cursor-pointer">
              <FiTrash2 className="inline mr-1" size={14} /> Delete ({selectedIds.size})
            </button>
          )}
          <Button onClick={() => { setEditId(null); setForm({ name: "", slug: "", icon: "", parent: "" }); setModalOpen(true); }}>
            <FiPlus className="mr-2" size={16} /> Add Category
          </Button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-4 px-3 w-10">
                  <input type="checkbox" onChange={() => {
                    if (selectedIds.size === allCategories.length) setSelectedIds(new Set());
                    else setSelectedIds(new Set(allCategories.map(c => c._id)));
                  }} checked={selectedIds.size === allCategories.length && allCategories.length > 0}
                  className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-blue-600 cursor-pointer" />
                </th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Icon</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Name</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Type</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Slug</th>
                <th className="py-4 px-5" />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <Fragment key={cat._id}>
                  <tr key={cat._id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="py-3 px-3">
                      <input type="checkbox" checked={selectedIds.has(cat._id)} onChange={() => toggleSelect(cat._id)}
                        className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-blue-600 cursor-pointer" />
                    </td>
                    <td className="py-3 px-5 text-2xl">{cat.icon || "📦"}</td>
                    <td className="py-3 px-5 text-white font-semibold">{cat.name}</td>
                    <td className="py-3 px-5"><Badge variant="info">Parent</Badge></td>
                    <td className="py-3 px-5 text-slate-400">{cat.slug}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => handleEdit(cat)} className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 cursor-pointer">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 cursor-pointer">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Sub-categories */}
                  {cat.children?.map((sub) => (
                    <tr key={sub._id} className="border-b border-slate-800/30 hover:bg-slate-800/10 bg-slate-900/30">
                      <td className="py-2 px-3">
                        <input type="checkbox" checked={selectedIds.has(sub._id)} onChange={() => toggleSelect(sub._id)}
                          className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-blue-600 cursor-pointer" />
                      </td>
                      <td className="py-2 px-5 pl-10 text-lg">
                        <FiChevronRight className="inline text-slate-600 mr-1" size={12} />
                        {sub.icon || "📦"}
                      </td>
                      <td className="py-2 px-5 text-slate-300">{sub.name}</td>
                      <td className="py-2 px-5"><Badge variant="default">Sub</Badge></td>
                      <td className="py-2 px-5 text-slate-500 text-xs">{sub.slug}</td>
                      <td className="py-2 px-5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => handleEdit(sub)} className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 cursor-pointer">
                            <FiEdit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(sub._id)} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 cursor-pointer">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-500">No categories yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required id="cat-name" />
          <Input label="Slug (URL)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Auto-generated if left empty" id="cat-slug" />
          <Input label="Icon (Emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📱" id="cat-icon" />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Parent Category</label>
            <select
              value={form.parent}
              onChange={(e) => setForm({ ...form, parent: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              <option value="">None (Parent Category)</option>
              {parentOptions.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Leave empty to create a parent category, or select a parent to create a sub-category.</p>
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
