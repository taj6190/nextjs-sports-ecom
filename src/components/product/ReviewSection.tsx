"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FiStar, FiSend, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import type { IReview } from "@/types";

interface ReviewSectionProps {
  productId: string;
}

interface ReviewStats {
  avgRating: number;
  total: number;
  distribution: { star: number; count: number }[];
}

function StarRating({ rating, size = 16, interactive = false, onChange }: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
        >
          <FiStar
            size={size}
            className={`${
              star <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={`${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : star - 0.5 <= rating
                ? "fill-amber-400/50 text-amber-400"
                : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

export { StarDisplay };

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    comment: "",
  });

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?product=${productId}`);
      const json = await res.json();
      if (json.success) {
        setReviews(json.data);
        setStats(json.stats);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!newReview.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...newReview }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Review submitted! 🎉");
        setNewReview({ rating: 0, title: "", comment: "" });
        setShowForm(false);
        fetchReviews();
      } else {
        toast.error(json.error || "Failed to submit review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const hasUserReviewed = reviews.some(
    (r) => typeof r.user === "object" && r.user._id === session?.user?.id
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="mt-10 bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-wide">
          Ratings & Reviews
        </h2>
        {session && !hasUserReviewed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Write a Review
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading reviews...</div>
      ) : (
        <div className="p-6">
          {/* Stats Overview */}
          {stats && stats.total > 0 && (
            <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-6 border-b border-slate-200">
              {/* Average */}
              <div className="text-center sm:text-left">
                <div className="text-5xl font-bold text-slate-900 mb-1">{stats.avgRating}</div>
                <StarDisplay rating={stats.avgRating} size={18} />
                <p className="text-sm text-slate-500 mt-1">{stats.total} review{stats.total > 1 ? "s" : ""}</p>
              </div>

              {/* Distribution Bars */}
              <div className="flex-1 space-y-1.5 max-w-xs">
                {stats.distribution.map((d) => (
                  <div key={d.star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-slate-500">{d.star}</span>
                    <FiStar size={12} className="text-amber-400 fill-amber-400" />
                    <div className="flex-1 h-2.5 bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${stats.total > 0 ? (d.count / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-slate-400 text-xs">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write Review Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Your Review</h3>

              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Rating *</label>
                <StarRating
                  rating={newReview.rating}
                  size={28}
                  interactive
                  onChange={(r) => setNewReview({ ...newReview, rating: r })}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Title (optional)</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="Sum up your experience in a few words"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Your Review *</label>
                <textarea
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FiSend size={14} />
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Login prompt */}
          {!session && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-sm text-blue-700">
              <a href="/login" className="font-medium underline">Sign in</a> to write a review.
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-slate-100">
              {reviews.map((review) => (
                <div key={review._id} className="py-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <FiUser className="text-white" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {typeof review.user === "object" ? review.user.name : "Anonymous"}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                      </div>
                      <StarDisplay rating={review.rating} size={13} />
                      {review.title && (
                        <p className="text-sm font-semibold text-slate-800 mt-2">{review.title}</p>
                      )}
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
