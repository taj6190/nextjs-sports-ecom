"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlistStore } from "@/stores/wishlistStore";
import { FiHeart } from "react-icons/fi";
import toast from "react-hot-toast";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
  variant?: "icon" | "button";
}

export default function WishlistButton({
  productId,
  className = "",
  size = 18,
  variant = "icon",
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { hasItem, toggleItem } = useWishlistStore();
  const isSaved = hasItem(productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("Please sign in to save to wishlist");
      router.push("/login");
      return;
    }

    await toggleItem(productId);
    toast.success(isSaved ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-5 py-2.5 border text-sm font-medium transition-all cursor-pointer ${
          isSaved
            ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
            : "border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-500 hover:bg-red-50"
        } ${className}`}
      >
        <FiHeart
          size={size}
          className={isSaved ? "fill-red-500 text-red-500" : ""}
        />
        {isSaved ? "Saved" : "Save to Wishlist"}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 transition-all cursor-pointer group ${className}`}
      title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <FiHeart
        size={size}
        className={`transition-all ${
          isSaved
            ? "fill-red-500 text-red-500 scale-110"
            : "text-slate-400 group-hover:text-red-400 group-hover:scale-110"
        }`}
      />
    </button>
  );
}
