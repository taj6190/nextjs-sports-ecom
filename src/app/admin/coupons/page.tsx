"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiGift, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

interface ProductOption {
  _id: string;
  name: string;
  basePrice: number;
}

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  minimumPurchaseAmount?: number;
  applicableProducts: string[];
  isActive: boolean;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed_amount",
    discountValue: "",
    minimumPurchaseAmount: "",
    usageLimit: "",
    usageLimitPerUser: "",
  });

  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const json = await res.json();
      if (json.success) setCoupons(json.data);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Async product search handler
  useEffect(() => {
    const delayDebounceFunc = setTimeout(async () => {
      if (productSearch.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/products?search=${encodeURIComponent(productSearch)}&limit=5`);
          const json = await res.json();
          if (json.success) {
            setProductResults(json.data);
          }
        } catch (e) {
          console.error("Search failed:", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setProductResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFunc);
  }, [productSearch]);

  const addProduct = (p: ProductOption) => {
    if (!selectedProducts.find((sp) => sp._id === p._id)) {
      setSelectedProducts([...selectedProducts, p]);
    }
    setProductSearch("");
    setProductResults([]);
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p._id !== id));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) {
      return toast.error("Code and discount value are required");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCoupon,
          code: newCoupon.code,
          discountValue: Number(newCoupon.discountValue),
          minimumPurchaseAmount: newCoupon.minimumPurchaseAmount ? Number(newCoupon.minimumPurchaseAmount) : 0,
          usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : undefined,
          usageLimitPerUser: newCoupon.usageLimitPerUser ? Number(newCoupon.usageLimitPerUser) : undefined,
          applicableProducts: selectedProducts.map(p => p._id),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Coupon created successfully");
        setNewCoupon({ code: "", discountType: "percentage", discountValue: "", minimumPurchaseAmount: "", usageLimit: "", usageLimitPerUser: "" });
        setSelectedProducts([]);
        fetchCoupons();
      } else {
        toast.error(json.error || "Failed to create coupon");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        toast.success("Status updated");
        fetchCoupons();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Coupon deleted");
        fetchCoupons();
      }
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiGift className="text-blue-500" />
            Promo Codes (Advanced)
          </h1>
          <p className="text-slate-400 text-sm">Control generic and product-specific discount tiers seamlessly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-fit">
          <h2 className="text-lg font-semibold mb-4">Create Special Deal</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Coupon String (e.g., BLACKFRIDAY)"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              required
              id="couponCode"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <label className={`block py-3 px-4 rounded-xl border text-center cursor-pointer transition-all ${newCoupon.discountType === 'percentage' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                <input type="radio" name="dType" className="hidden" checked={newCoupon.discountType === 'percentage'} onChange={() => setNewCoupon({...newCoupon, discountType: 'percentage'})} />
                <span className="text-sm font-medium">Percentage %</span>
              </label>
              <label className={`block py-3 px-4 rounded-xl border text-center cursor-pointer transition-all ${newCoupon.discountType === 'fixed_amount' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                <input type="radio" name="dType" className="hidden" checked={newCoupon.discountType === 'fixed_amount'} onChange={() => setNewCoupon({...newCoupon, discountType: 'fixed_amount'})} />
                <span className="text-sm font-medium">Fixed ৳</span>
              </label>
            </div>

            <Input
              label={newCoupon.discountType === 'percentage' ? "Discount (%)" : "Discount Amount (৳)"}
              type="number"
              min="1"
              max={newCoupon.discountType === 'percentage' ? "100" : undefined}
              value={newCoupon.discountValue}
              onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
              required
              id="discountValue"
            />

            <Input
              label="Minimum Spend (৳)"
              type="number"
              min="0"
              value={newCoupon.minimumPurchaseAmount}
              onChange={(e) => setNewCoupon({ ...newCoupon, minimumPurchaseAmount: e.target.value })}
              id="minPurchase"
              placeholder="0 means no minimum"
            />

            <Input
              label="Global Usage Limit"
              type="number"
              min="1"
              value={newCoupon.usageLimit}
              onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
              id="usageLimit"
              placeholder="e.g., First 100 Buyers"
            />

            <Input
              label="Usage Limit per User"
              type="number"
              min="1"
              value={newCoupon.usageLimitPerUser}
              onChange={(e) => setNewCoupon({ ...newCoupon, usageLimitPerUser: e.target.value })}
              id="usageLimitPerUser"
              placeholder="e.g., 1 (Use only once)"
            />

            {/* Product Specific Control */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bind to Specific Products</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Leave empty for Store-wide..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-1 focus:ring-blue-500"
                />
                
                {/* Search Dropdown */}
                {productResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                    {productResults.map(p => (
                      <button type="button" key={p._id} onClick={() => addProduct(p)} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border-b border-slate-700/50 last:border-0 flex justify-between">
                        <span className="truncate pr-2">{p.name}</span>
                        <span className="text-emerald-400 font-mono">৳{p.basePrice}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Selected Pills */}
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedProducts.map(p => (
                    <div key={p._id} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
                      <span className="text-[10px] text-blue-400 font-medium truncate max-w-[120px]">{p.name}</span>
                      <button type="button" onClick={() => removeProduct(p._id)} className="text-blue-500 hover:text-blue-300"><FiX size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              <FiPlus className="mr-2" /> Launch Coupon Strategy
            </Button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center text-slate-500">
              <FiRefreshCw className="animate-spin text-2xl" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <p>No coupons found. Engineer a product-targeted promo strategy!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Strategy</th>
                    <th className="px-4 py-3 font-medium">Discount</th>
                    <th className="px-4 py-3 font-medium">Config</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-bold text-white tracking-wider">
                        <div className="flex gap-2 items-center">
                          {c.code}
                          {c.applicableProducts && c.applicableProducts.length > 0 ? (
                            <span className="text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">Targeted</span>
                          ) : <span className="text-[9px] uppercase tracking-widest bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">Storewide</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-medium">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] space-y-1">
                        <div><span className="text-slate-500">Min Spend:</span> {c.minimumPurchaseAmount ? `৳${c.minimumPurchaseAmount}` : 'None'}</div>
                        <div><span className="text-slate-500">Global Limit:</span> {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : ""}</div>
                        {c.usageLimitPerUser && <div><span className="text-slate-500">Per User:</span> {c.usageLimitPerUser} max</div>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(c._id, c.isActive)}
                          className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                            c.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {c.isActive ? "Live" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
