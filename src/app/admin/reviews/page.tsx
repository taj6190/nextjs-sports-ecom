"use client";

import { useState, useEffect } from "react";
import { FiStar, FiCheck, FiTrash2, FiRefreshCw, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

interface Review {
  _id: string;
  user: { _id: string; name: string };
  product: { _id: string; name: string };
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const json = await res.json();
      if (json.success) setReviews(json.data);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Review deleted");
        fetchReviews();
      }
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const toggleApproval = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !current }),
      });
      if (res.ok) {
        toast.success("Status updated");
        fetchReviews();
      }
    } catch {
      toast.error("Failed to update review");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiStar className="text-amber-400" />
          Customer Reviews
        </h1>
        <p className="text-slate-400 text-sm">Manage and moderate customer testimonies.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-10 text-slate-500">
          <FiRefreshCw className="animate-spin text-2xl" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-10 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
          <p>No reviews yet.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Review</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiUser className="text-white" size={12} />
                        </div>
                        <span className="text-white text-sm font-medium">{r.user?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs max-w-[160px] truncate">
                      {r.product?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar
                            key={s}
                            size={12}
                            className={s <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[250px]">
                      {r.title && <span className="block font-semibold text-white mb-0.5">{r.title}</span>}
                      <span className="line-clamp-2">{r.comment}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleApproval(r._id, r.isApproved)}
                        className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold cursor-pointer ${
                          r.isApproved
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {r.isApproved ? "Approved" : "Pending"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
