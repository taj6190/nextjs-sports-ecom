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
    if (selectedIds.size === 0) { toast.error("No items selected"); return; }
    if (action === "delete" && !confirm(`Move ${selectedIds.size} products to recycle bin?`)) return;

    setBulkLoading(true);
    try {
      const res = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, type: "product", ids: Array.from(selectedIds) }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setSelectedIds(new Set());
        fetchProducts();
      } else {
        toast.error(json.error || "Failed");
      }
    } catch {
      toast.error("Operation failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Move this product to recycle bin?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("Moved to recycle bin"); fetchProducts(); }
    else toast.error(json.error || "Failed");
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
        >
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search & Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-blue-400 font-medium">{selectedIds.size} selected</span>
            <button onClick={() => handleBulkAction("activate")} disabled={bulkLoading}
              className="px-3 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50">
              <FiCheck className="inline mr-1" size={12} /> Activate
            </button>
            <button onClick={() => handleBulkAction("deactivate")} disabled={bulkLoading}
              className="px-3 py-2 bg-slate-700/50 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50">
              <FiX className="inline mr-1" size={12} /> Deactivate
            </button>
            <button onClick={() => handleBulkAction("feature")} disabled={bulkLoading}
              className="px-3 py-2 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-lg hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-50">
              <FiStar className="inline mr-1" size={12} /> Feature
            </button>
            <button onClick={() => handleBulkAction("delete")} disabled={bulkLoading}
              className="px-3 py-2 bg-red-500/10 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50">
              <FiTrash2 className="inline mr-1" size={12} /> Delete
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 text-slate-500 text-xs rounded-lg hover:text-white cursor-pointer">
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-4 px-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-4 px-3 text-slate-400 font-medium">Product</th>
                  <th className="text-left py-4 px-3 text-slate-400 font-medium">Category</th>
                  <th className="text-left py-4 px-3 text-slate-400 font-medium">Price</th>
                  <th className="text-left py-4 px-3 text-slate-400 font-medium">Stock</th>
                  <th className="text-left py-4 px-3 text-slate-400 font-medium">Sales</th>
                  <th className="text-left py-4 px-3 text-slate-400 font-medium">Status</th>
                  <th className="py-4 px-3" />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className={`border-b border-slate-800/50 hover:bg-slate-800/20 ${selectedIds.has(product._id) ? "bg-blue-500/5" : ""}`}>
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <Image src={product.images[0].url} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">N/A</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white line-clamp-1">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {typeof product.category === "object" && product.category ? (product.category as { name: string }).name : "—"}
                    </td>
                    <td className="py-3 px-3 text-white font-medium">{formatPrice(product.basePrice)}</td>
                    <td className="py-3 px-3">
                      <Badge variant={product.totalStock === 0 ? "danger" : product.totalStock <= 5 ? "warning" : "success"}>
                        {product.totalStock}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{product.purchaseCount || 0}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <Badge variant={product.isActive ? "success" : "danger"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {product.isFeatured && <Badge variant="info">★</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/products/${product._id}/edit`}
                          className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-all">
                          <FiEdit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(product._id)}
                          className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      {searchFilter ? "No products match your search" : "No products yet. Click \"Add Product\" to create one."}
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
