"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiPackage, FiAlertCircle } from "react-icons/fi";

interface InventoryItem {
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  combination: Record<string, string>;
  stock: number;
  price: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

interface InventoryStats {
  totalProducts: number;
  totalVariants: number;
  outOfStock: number;
  lowStock: number;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ totalProducts: 0, totalVariants: 0, outOfStock: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, number>>({});

  const fetchInventory = async () => {
    const res = await fetch("/api/inventory");
    const json = await res.json();
    if (json.success) {
      setInventory(json.data);
      setStats(json.stats);
    }
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleStockChange = (sku: string, value: number) => {
    setEdits({ ...edits, [sku]: value });
  };

  const saveChanges = async () => {
    const updates = Object.entries(edits).map(([sku, stock]) => {
      const item = inventory.find((i) => i.sku === sku);
      return { productId: item?.productId, sku, stock };
    });

    const res = await fetch("/api/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    const json = await res.json();
    if (json.success) {
      toast.success("Stock updated!");
      setEdits({});
      fetchInventory();
    } else {
      toast.error("Failed to update stock");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage stock levels</p>
        </div>
        {Object.keys(edits).length > 0 && (
          <Button onClick={saveChanges}>
            Save Changes ({Object.keys(edits).length})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 text-center">
          <FiPackage className="mx-auto text-blue-400 mb-1" size={20} />
          <p className="text-xs text-slate-500">Total Products</p>
          <p className="text-xl font-bold text-white">{stats.totalProducts}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 text-center">
          <FiPackage className="mx-auto text-purple-400 mb-1" size={20} />
          <p className="text-xs text-slate-500">Total Variants</p>
          <p className="text-xl font-bold text-white">{stats.totalVariants}</p>
        </div>
        <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4 text-center">
          <FiAlertTriangle className="mx-auto text-amber-400 mb-1" size={20} />
          <p className="text-xs text-slate-500">Low Stock</p>
          <p className="text-xl font-bold text-amber-400">{stats.lowStock}</p>
        </div>
        <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-4 text-center">
          <FiAlertCircle className="mx-auto text-red-400 mb-1" size={20} />
          <p className="text-xs text-slate-500">Out of Stock</p>
          <p className="text-xl font-bold text-red-400">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Product</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">SKU</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Variant</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Price</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Stock</th>
                  <th className="text-left py-4 px-5 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.sku} className={`border-b border-slate-800/50 hover:bg-slate-800/20 ${item.isOutOfStock ? "bg-red-500/5" : item.isLowStock ? "bg-amber-500/5" : ""}`}>
                    <td className="py-3 px-5 text-white font-medium">{item.productName}</td>
                    <td className="py-3 px-5 text-slate-400 font-mono text-xs">{item.sku}</td>
                    <td className="py-3 px-5">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.combination).map(([key, val]) => (
                          <span key={key} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded">
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-white">{formatPrice(item.price)}</td>
                    <td className="py-3 px-5">
                      <input
                        type="number"
                        value={edits[item.sku] !== undefined ? edits[item.sku] : item.stock}
                        onChange={(e) => handleStockChange(item.sku, parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-20 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                    </td>
                    <td className="py-3 px-5">
                      {item.isOutOfStock ? (
                        <Badge variant="danger">Out of Stock</Badge>
                      ) : item.isLowStock ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-500">No inventory data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
