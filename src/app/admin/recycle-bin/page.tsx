"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { FiTrash2, FiRotateCcw, FiBox, FiTag, FiBookmark } from "react-icons/fi";
import toast from "react-hot-toast";

interface RecycleItem {
  _id: string;
  name: string;
  slug: string;
  deletedAt: string;
}

export default function AdminRecycleBinPage() {
  const [data, setData] = useState<{ products: RecycleItem[]; categories: RecycleItem[]; brands: RecycleItem[] }>({ products: [], categories: [], brands: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "brands">("products");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    const res = await fetch("/api/recycle-bin");
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRestore = async (ids: string[], type: string) => {
    const res = await fetch("/api/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", type, ids }),
    });
    const json = await res.json();
    if (json.success) { toast.success(json.message); setSelectedIds(new Set()); fetchData(); }
    else toast.error(json.error || "Failed");
  };

  const handlePermanentDelete = async (ids: string[], type: string) => {
    if (!confirm(`Permanently delete ${ids.length} item(s)? This cannot be undone.`)) return;
    const res = await fetch("/api/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "permanent_delete", type, ids }),
    });
    const json = await res.json();
    if (json.success) { toast.success(json.message); setSelectedIds(new Set()); fetchData(); }
    else toast.error(json.error || "Failed");
  };

  const toggleSelect = (id: string) => { const s = new Set(selectedIds); s.has(id) ? s.delete(id) : s.add(id); setSelectedIds(s); };

  const currentItems = data[activeTab] || [];
  const typeMap = { products: "product", categories: "category", brands: "brand" };
  const totalDeleted = data.products.length + data.categories.length + data.brands.length;

  const tabs = [
    { key: "products" as const, label: "Products", icon: FiBox, count: data.products.length },
    { key: "categories" as const, label: "Categories", icon: FiTag, count: data.categories.length },
    { key: "brands" as const, label: "Brands", icon: FiBookmark, count: data.brands.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiTrash2 className="text-slate-400" /> Recycle Bin
        </h1>
        <p className="text-sm text-slate-500 mt-1">{totalDeleted} deleted items • Items can be restored or permanently removed</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === tab.key ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}>
              <Icon size={16} /> {tab.label} {tab.count > 0 && <Badge variant="default">{tab.count}</Badge>}
            </button>
          );
        })}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700 rounded-xl">
          <span className="text-sm text-blue-400 font-medium">{selectedIds.size} selected</span>
          <button onClick={() => handleRestore(Array.from(selectedIds), typeMap[activeTab])}
            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/20 transition-all cursor-pointer">
            <FiRotateCcw className="inline mr-1" size={12} /> Restore
          </button>
          <button onClick={() => handlePermanentDelete(Array.from(selectedIds), typeMap[activeTab])}
            className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-all cursor-pointer">
            <FiTrash2 className="inline mr-1" size={12} /> Delete Forever
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-4 px-3 w-10">
                  <input type="checkbox" onChange={() => selectedIds.size === currentItems.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(currentItems.map(i => i._id)))}
                    checked={selectedIds.size === currentItems.length && currentItems.length > 0} className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-blue-600 cursor-pointer" />
                </th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Name</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Slug</th>
                <th className="text-left py-4 px-5 text-slate-400 font-medium">Deleted On</th>
                <th className="py-4 px-5" />
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item._id} className={`border-b border-slate-800/50 hover:bg-slate-800/20 ${selectedIds.has(item._id) ? "bg-blue-500/5" : ""}`}>
                  <td className="py-3 px-3">
                    <input type="checkbox" checked={selectedIds.has(item._id)} onChange={() => toggleSelect(item._id)}
                      className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-blue-600 cursor-pointer" />
                  </td>
                  <td className="py-3 px-5 text-white font-medium">{item.name}</td>
                  <td className="py-3 px-5 text-slate-500 text-xs">{item.slug}</td>
                  <td className="py-3 px-5 text-slate-400 text-xs">{new Date(item.deletedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => handleRestore([item._id], typeMap[activeTab])} title="Restore"
                        className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 cursor-pointer"><FiRotateCcw size={14} /></button>
                      <button onClick={() => handlePermanentDelete([item._id], typeMap[activeTab])} title="Delete forever"
                        className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 cursor-pointer"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-slate-500">Recycle bin is empty ✓</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
