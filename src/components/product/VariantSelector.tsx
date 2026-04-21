"use client";

import { cn, formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import type { IImage, IProduct, ITodaysDeal, IVariant } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiMinus, FiPlus, FiRefreshCw, FiShare2, FiShield, FiShoppingCart, FiTruck, FiZap } from "react-icons/fi";
import ProductGallery from "./ProductGallery";
import { StarDisplay } from "./ReviewSection";
import WhatsAppButton from "./WhatsAppButton";
import WishlistButton from "./WishlistButton";

interface VariantSelectorProps {
  product: IProduct;
  deal?: ITodaysDeal | null;
}

export default function VariantSelector({ product, deal }: VariantSelectorProps) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    if (product.variants.length > 0) {
      const first = product.variants[0];
      return typeof first.combination === "object" ? { ...first.combination } : {};
    }
    return {};
  });

  const [quantity, setQuantity] = useState(1);

  const matchedVariant = useMemo<IVariant | null>(() => {
    if (product.attributes.length === 0 && product.variants.length > 0) {
      return product.variants[0];
    }
    return product.variants.find((v) => {
      const combo = v.combination instanceof Map ? Object.fromEntries(v.combination) : v.combination;
      return Object.entries(selected).every(([key, value]) => combo[key] === value);
    }) || null;
  }, [selected, product.variants, product.attributes]);

  const galleryImages = useMemo<IImage[]>(() => {
    const variantImages = matchedVariant?.images || [];
    const globalImages = product.images || [];
    return [...variantImages, ...globalImages];
  }, [matchedVariant, product.images]);

  const handleSelect = useCallback((attrName: string, value: string) => {
    setSelected((prev) => ({ ...prev, [attrName]: value }));
    setQuantity(1);
  }, []);

  const getAvailableValues = useCallback((attrName: string, value: string) => {
    const testSelection = { ...selected, [attrName]: value };
    return product.variants.some((v) => {
      const combo = v.combination instanceof Map ? Object.fromEntries(v.combination) : v.combination;
      return Object.entries(testSelection).every(([key, val]) => !val || combo[key] === val) && v.isActive && v.stock > 0;
    });
  }, [selected, product.variants]);

  const handleAddToCart = () => {
    if (!matchedVariant) { toast.error("Please select all options"); return; }
    if (matchedVariant.stock === 0) { toast.error("This variant is out of stock"); return; }
    const cartItem = {
      productId: product._id,
      productName: product.name,
      productSlug: product.slug,
      productImage: galleryImages[0]?.url || "",
        variant: {
          sku: matchedVariant.sku,
          combination: matchedVariant.combination instanceof Map ? Object.fromEntries(matchedVariant.combination) : matchedVariant.combination,
          price: currentPrice,
        },
        quantity,
        maxStock: matchedVariant.stock,
      };
      addItem(cartItem);
      toast.success("Added to cart!");
    };

    const handleBuyNow = () => {
      if (!matchedVariant || matchedVariant.stock === 0) return;
      handleAddToCart();
      router.push("/checkout");
    };

    const currentPrice = deal ? deal.dealPrice : (matchedVariant?.discountPrice || matchedVariant?.price || product.basePrice);
    const originalPrice = deal ? deal.originalPrice : (matchedVariant?.discountPrice ? (matchedVariant.price || product.basePrice) : null);
    const discountPercentage = (originalPrice && currentPrice < originalPrice) ? getDiscountPercentage(originalPrice, currentPrice) : 0;
    const productUrl = typeof window !== "undefined" ? window.location.href : "";

    // Helper to detect color string
    const isColor = (str: string) => str.startsWith("#") || str.startsWith("rgb") || str.includes("|#");
    const getColorValue = (str: string) => str.includes("|") ? str.split("|")[1] : str;
    const getColorName = (str: string) => str.includes("|") ? str.split("|")[0] : str;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Left: Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery images={galleryImages} productName={product.name} />
        </div>

        {/* Right: Info Area */}
        <div className="lg:col-span-5 space-y-8">
          {/* Brand Header */}
          <div className="relative group">
             <div className="absolute top-0 left-0 w-8 h-1 bg-[#ef4a23]" />
             <div className="pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black tracking-[0.2em] text-[#ef4a23] uppercase italic">
                     Professional Grade // {product.brand || "velocity"}
                  </span>
                  <h1 className="text-3xl lg:text-4xl font-black text-[#081621] uppercase italic tracking-tighter leading-[0.9] mt-2">
                    {product.name}
                  </h1>
                </div>
                <div className="flex gap-2">
                   <button className="w-10 h-10 border border-[#eee] flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
                      <FiShare2 size={16} className="text-[#666]" />
                   </button>
                </div>
             </div>

             {product.reviewCount > 0 && (
               <div className="flex items-center gap-2 mt-4">
                 <StarDisplay rating={product.avgRating} size={13} />
                 <span className="text-[11px] font-bold text-[#999] uppercase tracking-widest">
                   {product.reviewCount} Reports
                 </span>
               </div>
             )}
          </div>

          {/* Price Block */}
          <div className="bg-[#081621] p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-full bg-[#ef4a23]/10 skew-x-[-20deg] translate-x-16" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#ef4a23] mb-2">Current MSRP</p>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black italic tracking-tighter">{formatPrice(currentPrice)}</span>
                {originalPrice && originalPrice > currentPrice && (
                  <span className="text-lg text-white/50 line-through italic font-bold">{formatPrice(originalPrice)}</span>
                )}
              </div>
              {discountPercentage > 0 && (
                <div className="mt-3 inline-block bg-[#ef4a23] px-3 py-1 text-[10px] font-black uppercase italic tracking-widest">
                  Save {discountPercentage}% OFF
                </div>
              )}
            </div>
          </div>

        {/* Variations */}
        <div className="space-y-6">
          {product.attributes.map((attr) => (
            <div key={attr.name}>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#081621] italic">
                  // {attr.name}: <span className="text-[#ef4a23]">{selected[attr.name] ? getColorName(selected[attr.name]) : "Pending"}</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {attr.values.map((val) => {
                  const isSelected = selected[attr.name] === val;
                  const isAvailable = getAvailableValues(attr.name, val);
                  const colorCode = isColor(val) ? getColorValue(val) : null;

                  return (
                    <button
                      key={val}
                      onClick={() => handleSelect(attr.name, val)}
                      disabled={!isAvailable}
                      style={colorCode ? { backgroundColor: colorCode } : {}}
                      className={cn(
                        "relative transition-all cursor-pointer group",
                        colorCode
                          ? "w-10 h-10 border-2"
                          : "px-5 py-2.5 border-2 text-[12px] font-black uppercase italic",
                        isSelected
                          ? "border-[#ef4a23] text-[#ef4a23] bg-[#ef4a23]/5"
                          : "border-[#eee] text-[#666] hover:border-[#aaa] bg-white",
                        !isAvailable && "opacity-20 cursor-not-allowed grayscale"
                      )}
                    >
                      {!colorCode && val}
                      {colorCode && isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-1.5 h-1.5 bg-white rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions Grid */}
        <div className="space-y-4">
           {/* Quantity & SKU */}
           <div className="flex items-center gap-4">
              <div className="flex border-2 border-[#081621]">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-[#eee] transition-colors cursor-pointer border-r-2 border-[#081621]"><FiMinus size={14} /></button>
                 <div className="w-14 h-10 flex items-center justify-center text-[14px] font-black italic">{quantity}</div>
                 <button onClick={() => setQuantity(Math.min(matchedVariant?.stock || 99, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-[#eee] transition-colors cursor-pointer border-l-2 border-[#081621]"><FiPlus size={14} /></button>
              </div>
              {matchedVariant && (
                <div className="px-4 py-2 border-2 border-[#eee] bg-[#fafafa] flex-1">
                   <p className="text-[9px] font-black text-[#999] uppercase tracking-widest leading-none">Serial // S-Number</p>
                   <p className="text-[12px] font-bold text-[#111] uppercase mt-1">{matchedVariant.sku}</p>
                </div>
              )}
           </div>

           {/* Main CTA */}
           <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!matchedVariant || matchedVariant.stock === 0}
                className="col-span-1 py-5 border-2 border-[#081621] text-[#081621] font-black uppercase italic tracking-widest text-[13px] hover:bg-[#081621] hover:text-white transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FiShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                {matchedVariant?.stock === 0 ? "Empty" : "Add Gear"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!matchedVariant || matchedVariant.stock === 0}
                className="col-span-1 py-5 bg-[#ef4a23] text-white font-black uppercase italic tracking-widest text-[13px] hover:bg-[#d83d1c] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-[0_10px_20px_rgba(239,74,35,0.2)]"
              >
                <FiZap size={18} />
                Deploy
              </button>
           </div>

           {/* Auxiliary Actions */}
           <div className="grid grid-cols-2 gap-3">
              <WishlistButton productId={product._id} variant="button" className="!rounded-none !h-[50px] !border-2 !border-[#eee] !bg-white !text-[#333] !font-black !uppercase !italic !text-[11px] !tracking-widest" />
              <WhatsAppButton productName={product.name} productUrl={productUrl} variant="full" className="!rounded-none !h-[50px] !bg-[#25D366] !text-white !font-black !uppercase !italic !text-[11px] !tracking-widest" />
           </div>
        </div>

        {/* Short Description */}
        {product.description && (
          <div className="relative pt-8 border-t-4 border-[#081621]">
            <div className="absolute top-[-14px] left-0 bg-[#081621] text-white px-3 py-0.5 text-[10px] font-black uppercase italic tracking-widest">
               briefings
            </div>
            <p className="text-[13px] text-[#444] leading-relaxed font-medium">
               {product.description.length > 300 ? product.description.slice(0, 300) + '...' : product.description}
            </p>
          </div>
        )}

        {/* Confidence Badges */}
        <div className="grid grid-cols-3 gap-1 bg-[#f8f9fa] border border-[#eee]">
           <div className="p-3 text-center border-r border-[#eee]">
              <FiTruck className="mx-auto text-[#ef4a23] mb-1" />
              <p className="text-[9px] font-black uppercase text-[#081621]">Rapid Delivery</p>
           </div>
           <div className="p-3 text-center border-r border-[#eee]">
              <FiShield className="mx-auto text-[#ef4a23] mb-1" />
              <p className="text-[9px] font-black uppercase text-[#081621]">Warranty Sec.</p>
           </div>
           <div className="p-3 text-center">
              <FiRefreshCw className="mx-auto text-[#ef4a23] mb-1" />
              <p className="text-[9px] font-black uppercase text-[#081621]">Easy Swap</p>
           </div>
        </div>
      </div>
    </div>
  );
}

