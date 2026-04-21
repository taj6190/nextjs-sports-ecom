"use client";

import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import type { IProduct } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiShoppingCart, FiPlus, FiBox } from "react-icons/fi";
import WishlistButton from "./WishlistButton";

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.variants?.[0]?.discountPrice
    ? getDiscountPercentage(product.basePrice, product.variants[0].discountPrice)
    : 0;

  const mainImage = product.images?.[0]?.url;
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
        combination: variant.combination instanceof Map ? Object.fromEntries(variant.combination) : variant.combination,
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
      useCartStore.getState().closeCart();
      router.push("/checkout");
    }
  };

  return (
    <div className="group bg-white border border-[#eee] transition-all duration-300 flex flex-col h-full hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 relative">
      {/* Brand Tag overlay */}
      <div className="absolute top-0 left-0 z-20 bg-[#081621] text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest italic">
         {product.brand || "VELOCITY"}
      </div>

      {/* Discount Badge - Top Right */}
      {discount > 0 && (
        <div className="absolute top-0 right-0 z-20 bg-[#ef4a23] text-white px-2 py-1 text-[11px] font-black uppercase italic tracking-tighter shadow-lg shadow-[#ef4a23]/20">
          SAVE {discount}%
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square bg-[#fafafa] overflow-hidden p-6 border-b border-[#f5f5f5]">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <FiBox size={40} />
          </div>
        )}

        {/* Status markers */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1 z-10">
          {product.totalStock === 0 && (
             <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase tracking-widest">OUT OF GEAR</span>
          )}
        </div>

        {/* Heart */}
        <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton
            productId={product._id}
            size={16}
            className="bg-white p-2 shadow-md hover:bg-[#ef4a23] hover:text-white transition-colors"
          />
        </div>
      </div>

      {/* Info Content */}
      <div className="p-5 flex flex-col items-center flex-1 text-center">
        <Link href={`/product/${product.slug}`} className="mb-2 w-full">
          <h3 className="text-[13px] font-black text-[#111] uppercase tracking-tighter line-clamp-2 leading-[1.3] group-hover:text-[#ef4a23] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Minimal Specs */}
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mb-4">
           {specSnippets.map((spec, i) => (
              <span key={i} className="text-[9px] font-bold text-[#999] uppercase tracking-widest">
                 {spec.value.slice(0, 15)}{spec.value.length > 15 ? '..' : ''}
              </span>
           ))}
        </div>

        <div className="mt-auto w-full">
           {/* Pricing */}
           <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-[20px] font-black text-[#111] italic tracking-tighter">
                {formatPrice(product.variants?.[0]?.discountPrice || product.basePrice)}
              </span>
              {(product.variants?.[0]?.discountPrice ?? 0) > 0 && (
                <span className="text-[12px] text-[#ccc] line-through italic font-bold">
                  {formatPrice(product.basePrice)}
                </span>
              )}
           </div>

           {/* Performance Buttons */}
           <div className="flex gap-1">
              {isVariable ? (
                 <button
                   onClick={(e) => { e.preventDefault(); router.push(`/product/${product.slug}`); }}
                   className="flex-1 py-3 bg-[#081621] text-white text-[10px] font-black uppercase tracking-[0.15em] italic hover:bg-[#ef4a23] transition-all"
                 >
                   Configure Item
                 </button>
              ) : (
                <>
                  <button
                    onClick={handleQuickBuy}
                    disabled={product.totalStock === 0}
                    className="flex-1 py-3 bg-[#ef4a23] text-white text-[10px] font-black uppercase tracking-[0.15em] italic hover:bg-black transition-all disabled:opacity-30"
                  >
                    Deploy
                  </button>
                  <button
                    onClick={(e) => handleAddToCart(e, false)}
                    disabled={product.totalStock === 0}
                    className="w-12 flex items-center justify-center bg-[#f0f0f0] text-[#111] hover:bg-[#111] hover:text-white transition-all disabled:opacity-30"
                  >
                    <FiPlus size={16} />
                  </button>
                </>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
