"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn, formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import ProductGallery from "./ProductGallery";
import WhatsAppButton from "./WhatsAppButton";
import CountdownTimer from "./CountdownTimer";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import type { IProduct, IVariant, IImage, ITodaysDeal } from "@/types";
import { FiShoppingCart, FiTruck, FiShield, FiRefreshCw, FiMinus, FiPlus, FiZap } from "react-icons/fi";
import toast from "react-hot-toast";
import WishlistButton from "./WishlistButton";
import { StarDisplay } from "./ReviewSection";

interface VariantSelectorProps {
  product: IProduct;
  deal?: ITodaysDeal | null;
}

export default function VariantSelector({ product, deal }: VariantSelectorProps) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  // Track selected attribute values
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    // Pre-select first variant's combination
    if (product.variants.length > 0) {
      const first = product.variants[0];
      return typeof first.combination === "object" ? { ...first.combination } : {};
    }
    return {};
  });

  const [quantity, setQuantity] = useState(1);

  // Find matching variant based on selections
  const matchedVariant = useMemo<IVariant | null>(() => {
    if (product.attributes.length === 0 && product.variants.length > 0) {
      return product.variants[0];
    }

    return product.variants.find((v) => {
      const combo = v.combination instanceof Map
        ? Object.fromEntries(v.combination)
        : v.combination;
      return Object.entries(selected).every(([key, value]) => combo[key] === value);
    }) || null;
  }, [selected, product.variants, product.attributes]);

  // Get images: variant images first, then global images
  const galleryImages = useMemo<IImage[]>(() => {
    const variantImages = matchedVariant?.images || [];
    const globalImages = product.images || [];
    return [...variantImages, ...globalImages];
  }, [matchedVariant, product.images]);

  // Handle attribute selection
  const handleSelect = useCallback((attrName: string, value: string) => {
    setSelected((prev) => ({ ...prev, [attrName]: value }));
    setQuantity(1);
  }, []);

  // Check which attribute values are available
  const getAvailableValues = useCallback(
    (attrName: string, value: string) => {
      const testSelection = { ...selected, [attrName]: value };
      return product.variants.some((v) => {
        const combo = v.combination instanceof Map
          ? Object.fromEntries(v.combination)
          : v.combination;
        return Object.entries(testSelection).every(
          ([key, val]) => !val || combo[key] === val
        ) && v.isActive && v.stock > 0;
      });
    },
    [selected, product.variants]
  );

  const getCartItem = () => {
    if (!matchedVariant) return null;
    const combo = matchedVariant.combination instanceof Map
      ? Object.fromEntries(matchedVariant.combination)
      : matchedVariant.combination;

    return {
      productId: product._id,
      productName: product.name,
      productSlug: product.slug,
      productImage: galleryImages[0]?.url || "",
      variant: {
        sku: matchedVariant.sku,
        combination: combo,
        price: deal ? deal.dealPrice : matchedVariant.price,
      },
      quantity,
      maxStock: matchedVariant.stock,
    };
  };

  const handleAddToCart = () => {
    if (!matchedVariant) {
      toast.error("Please select all options");
      return;
    }
    if (matchedVariant.stock === 0) {
      toast.error("This variant is out of stock");
      return;
    }

    const cartItem = getCartItem();
    if (cartItem) {
      addItem(cartItem);
      toast.success("Added to cart!");
    }
  };

  // Quick Buy Now - adds single item and goes straight to checkout
  const handleBuyNow = () => {
    if (!matchedVariant) {
      toast.error("Please select all options");
      return;
    }
    if (matchedVariant.stock === 0) {
      toast.error("This variant is out of stock");
      return;
    }

    const cartItem = getCartItem();
    if (cartItem) {
      useCartStore.getState().clearCart();
      addItem(cartItem, true); // true to prevent opening the dropdown menu
      useCartStore.getState().closeCart(); // force close just in case
      router.push("/checkout");
    }
  };

  const currentPrice = deal ? deal.dealPrice : (matchedVariant?.price || product.basePrice);
  const originalPrice = deal ? deal.originalPrice : matchedVariant?.discountPrice;
  const discount = originalPrice ? getDiscountPercentage(currentPrice, originalPrice) : 0;
  const productUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Gallery */}
      <ProductGallery images={galleryImages} productName={product.name} />

      {/* Product Info */}
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Home</span>
          <span>/</span>
          {typeof product.category === "object" && product.category && (
            <>
              <span className="text-blue-400/70">{(product.category as { name: string }).name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-slate-600">{product.name}</span>
        </div>

        {/* Deal Countdown */}
        {deal && (
          <CountdownTimer endTime={deal.endTime} />
        )}

        {/* Name & Brand */}
        <div>
          {product.brand && (
            <p className="text-sm text-blue-400 font-medium mb-1">{product.brand}</p>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
            {product.name}
          </h1>
          {/* Star Rating Summary */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <StarDisplay rating={product.avgRating} size={15} />
              <span className="text-sm text-slate-500">
                {product.avgRating} ({product.reviewCount} review{product.reviewCount > 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-slate-900">
            {formatPrice(currentPrice)}
          </span>
          {originalPrice && originalPrice > currentPrice ? (
            <span className="text-lg text-slate-600 line-through">
              {formatPrice(originalPrice)}
            </span>
          ) : null}
          {discount > 0 && (
            <Badge variant="danger">Save {discount}%</Badge>
          )}
          {deal && (
            <Badge variant="warning">🔥 Deal</Badge>
          )}
        </div>

        {/* SKU & Stock */}
        {matchedVariant && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">SKU: <span className="text-slate-600">{matchedVariant.sku}</span></span>
            <span className="text-slate-800">|</span>
            {matchedVariant.stock > 0 ? (
              <span className="text-emerald-400">
                ● In Stock ({matchedVariant.stock} available)
              </span>
            ) : (
              <span className="text-red-400">● Out of Stock</span>
            )}
          </div>
        )}

        {/* Variant Selectors */}
        {product.attributes.map((attr) => (
          <div key={attr.name}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {attr.name}: <span className="text-slate-900">{selected[attr.name] || "Select"}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {attr.values.map((value) => {
                const isSelected = selected[attr.name] === value;
                const isAvailable = getAvailableValues(attr.name, value);

                return (
                  <button
                    key={value}
                    onClick={() => handleSelect(attr.name, value)}
                    disabled={!isAvailable}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer",
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 text-blue-400 ring-2 ring-blue-500/20"
                        : isAvailable
                          ? "border-slate-300 text-slate-700 hover:border-slate-600 hover:text-slate-900"
                          : "border-slate-200 text-slate-700 cursor-not-allowed opacity-50 line-through"
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FiMinus size={16} />
              </button>
              <span className="px-4 py-2 text-slate-900 font-medium min-w-[48px] text-center bg-slate-100">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(matchedVariant?.stock || 1, quantity + 1))}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleAddToCart}
            disabled={!matchedVariant || matchedVariant.stock === 0}
            size="lg"
            className="flex-1"
          >
            <FiShoppingCart className="mr-2" size={18} />
            {matchedVariant?.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
          <button
            onClick={handleBuyNow}
            disabled={!matchedVariant || matchedVariant.stock === 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-slate-900 font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FiZap size={18} />
            Buy Now
          </button>
        </div>

        {/* Wishlist Button */}
        <WishlistButton productId={product._id} variant="button" className="w-full" />

        {/* WhatsApp */}
        <div className="flex items-center gap-3">
          <WhatsAppButton
            productName={product.name}
            productUrl={productUrl}
            price={formatPrice(currentPrice)}
            variant="full"
            className="flex-1"
          />
          <WhatsAppButton
            productName={product.name}
            productUrl={productUrl}
            variant="icon"
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200">
          <div className="text-center p-3">
            <FiTruck className="mx-auto text-blue-400 mb-1" size={20} />
            <p className="text-[11px] text-slate-500">Free Delivery</p>
            <p className="text-[10px] text-slate-600">Over ৳5,000</p>
          </div>
          <div className="text-center p-3">
            <FiShield className="mx-auto text-emerald-400 mb-1" size={20} />
            <p className="text-[11px] text-slate-500">Warranty</p>
            <p className="text-[10px] text-slate-600">Guaranteed</p>
          </div>
          <div className="text-center p-3">
            <FiRefreshCw className="mx-auto text-amber-400 mb-1" size={20} />
            <p className="text-[11px] text-slate-500">Easy Returns</p>
            <p className="text-[10px] text-slate-600">7 Days</p>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
