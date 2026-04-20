"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WishlistButton from "@/components/product/WishlistButton";
import { formatPrice } from "@/lib/utils";
import { FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import type { IProduct } from "@/types";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/stores/wishlistStore";

export default function WishlistPage() {
  const { data: session } = useSession();
  const { items: wishlistIds, isLoaded: wishlistLoaded } = useWishlistStore();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!wishlistLoaded) return; // Wait for Header to sync global store
      
      try {
        if (wishlistIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Fetch product details for the synced IDs safely
        const productsData: IProduct[] = [];
        for (const id of wishlistIds) {
          try {
            const res = await fetch(`/api/products/${id}`);
            const json = await res.json();
            if (json.success) productsData.push(json.data);
          } catch {
            // Skip failed fetches
          }
        }
        setProducts(productsData);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      if (wishlistLoaded) fetchWishlistProducts();
    } else {
      setLoading(false);
    }
  }, [session, wishlistIds, wishlistLoaded]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F2F4F8]">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mb-4">
            <FiHeart className="text-red-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Wishlist</h1>
          <p className="text-slate-600 mb-6">Please sign in to view your saved products.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all">
            Sign In
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F8]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <FiHeart className="text-red-500" size={24} />
          <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
          <span className="text-sm text-slate-500">({products.length} items)</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading your wishlist...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mb-4">
              <FiHeart className="text-red-300" size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No saved items yet</h2>
            <p className="text-slate-500 mb-6">Start browsing and heart the products you love!</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all">
              <FiShoppingBag size={16} /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <div key={product._id} className="group bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-all hover:shadow-xl hover:shadow-blue-500/5">
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <FiShoppingBag size={40} />
                    </div>
                  )}
                  {/* Heart button (always visible on wishlist page) */}
                  <div className="absolute top-3 right-3 z-10">
                    <WishlistButton productId={product._id} size={20} className="bg-white/80 backdrop-blur-sm rounded-full shadow-md" />
                  </div>
                </div>

                <div className="p-4">
                  {product.brand && (
                    <p className="text-[11px] text-blue-400/70 uppercase tracking-wider mb-1">{product.brand}</p>
                  )}
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="text-sm font-medium text-slate-900 line-clamp-2 hover:text-blue-400 transition-colors leading-snug">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  {product.reviewCount > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            size={11}
                            className={star <= Math.round(product.avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500">({product.reviewCount})</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-slate-900">{formatPrice(product.basePrice)}</span>
                    {product.totalStock > 0 ? (
                      <span className="text-xs text-emerald-500">In Stock</span>
                    ) : (
                      <span className="text-xs text-red-400">Out of Stock</span>
                    )}
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    className="block mt-3 text-center py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
