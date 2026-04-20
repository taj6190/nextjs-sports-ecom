"use client";

import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import type { IProduct } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiShoppingCart } from "react-icons/fi";
import WishlistButton from "./WishlistButton";

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.variants?.[0]?.discountPrice
    ? getDiscountPercentage(product.basePrice, product.variants[0].discountPrice)
    : 0;

  const mainImage = product.images?.[0]?.url;

  // Extract a few spec items mapping to bullet points for the StarTech style
  const specSnippets = product.specifications?.flatMap(g => g.items).slice(0, 3) || [];

  const router = useRouter();

  const isVariable = product.variants && product.variants.length > 1;

  const handleAddToCart = (e: React.MouseEvent, preventOpen = false) => {
    e.preventDefault();
    if (!product.variants || product.variants.length === 0) return;

    const variant = product.variants[0];

    useCartStore.getState().addItem({
      productId: product._id,
      productName: product.name,
      productSlug: product.slug,
      productImage: variant.images?.[0]?.url || product.images?.[0]?.url || "",
      variant: {
        sku: variant.sku,
        combination: variant.combination instanceof Map
            ? Object.fromEntries(variant.combination)
            : variant.combination,
        price: (variant.discountPrice ?? 0) > 0 ? variant.discountPrice! : variant.price,
      },
      quantity: 1,
      maxStock: variant.stock,
    }, preventOpen);
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    useCartStore.getState().clearCart();
    handleAddToCart(e, true);
    if (product.totalStock > 0) {
      // Force close cart UI just in case it was already open
      useCartStore.getState().closeCart();
      router.push("/checkout");
    }
  };

  return (
    <div className="group bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 flex flex-col h-full hover:shadow-[0_0_15px_rgba(0,0,0,0.05)]">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-white overflow-hidden p-4">
        {mainImage ? (
          <div className="relative w-full h-full">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
            <FiShoppingCart size={40} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {product.isFeatured && (
            <span className="px-2 py-0.5 bg-blue-100/80 text-blue-600 text-[10px] font-medium rounded-full border border-blue-200">
              Featured
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-0.5 bg-red-100/80 text-red-600 text-[10px] font-medium rounded-full border border-red-200">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            productId={product._id}
            size={18}
            className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 border-t border-slate-100">

        {/* Name */}
        <Link href={`/product/${product.slug}`} className="mb-3">
          <h3 className="text-[14px] font-semibold text-slate-800 line-clamp-2 hover:text-blue-600 hover:underline transition-colors leading-[1.4]">
            {product.name}
          </h3>
        </Link>

        {/* Bullet point specs (StarTech style) */}
        {specSnippets.length > 0 && (
          <ul className="mb-4 space-y-1.5 text-[12px] text-slate-600 flex-1">
            {specSnippets.map((spec, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-slate-400 mt-1.5 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                <span className="line-clamp-2">
                  <span className="font-medium">{spec.key}:</span> {spec.value}
                </span>
              </li>
            ))}
          </ul>
        )}
        {!specSnippets.length && <div className="flex-1" />}

        {/* Price & Actions Area */}
        <div className="mt-auto pt-4 flex flex-col items-center">

          {/* Price */}
          <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="text-[20px] font-bold text-[#ef4a23]"> {/* StarTech orange */}
              {formatPrice(product.variants?.[0]?.discountPrice || product.basePrice)}
            </span>
            {(product.variants?.[0]?.discountPrice ?? 0) > 0 && (
              <span className="text-[14px] text-slate-400 line-through">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full flex items-center justify-center gap-2">
            {isVariable ? (
               <button
                 onClick={(e) => { e.preventDefault(); router.push(`/product/${product.slug}`); }}
                 className="flex-1 flex items-center justify-center py-2.5 bg-[#f5f6fc] hover:bg-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm"
               >
                 Select Options
               </button>
            ) : (
              <>
                <button
                  onClick={handleQuickBuy}
                  disabled={product.totalStock === 0}
                  className="flex-1 flex items-center justify-center py-2 bg-[#e4173e] hover:bg-[#c91232] text-white text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_10px_rgba(228,23,62,0.2)]"
                >
                  Quick Buy
                </button>
                <button
                  onClick={(e) => handleAddToCart(e, false)}
                  disabled={product.totalStock === 0}
                  className="flex-1 flex items-center justify-center py-2 bg-[#f5f6fc] hover:bg-[#e8ebf5] text-slate-700 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}
