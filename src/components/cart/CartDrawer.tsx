"use client";

import { formatPrice, optimizeCloudinaryUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiBox, FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle smooth transition lifecycle
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const total = totalPrice();
  const freeShippingThreshold = 5000;
  const progressPercent = Math.min(100, (total / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden select-none">
      {/* Industrial Backdrop */}
      <div
        className={`fixed inset-0 bg-[#081621]/60 backdrop-blur-[4px] transition-opacity duration-300 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />

      {/* Gear Manifest Canvas */}
      <div className={`relative w-[90%] sm:w-[50%] md:w-[450px] h-full bg-white shadow-[0px_0px_50px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}>

        {/* Header Terminal */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-[#eee]">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-[#ef4a23]" />
             <h2 className="text-[14px] font-[1000] tracking-[0.3em] text-[#081621] uppercase italic">Gear // Manifest</h2>
             <span className="text-[10px] font-black text-[#ef4a23] italic ml-1">[{items.length}]</span>
          </div>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center text-[#081621] hover:bg-[#f8f8f8] transition-all cursor-pointer"
            aria-label="Close cart"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Tactical Logistic Alert */}
        {items.length > 0 && (
          <div className="px-6 py-4 bg-[#fcfcfc] border-b border-[#eee] relative overflow-hidden group">
            <div className="flex justify-between items-center mb-3">
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#081621]/40 italic">Logistics Status</span>
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ef4a23] italic">
                 {total >= freeShippingThreshold ? "Priority Clear" : "Pending Sync"}
               </span>
            </div>
            <p className="text-[10px] font-black text-[#081621] uppercase tracking-wider mb-3 italic">
              {total >= freeShippingThreshold
                ? "Tactical Advantage: Complementary Delivery Locked."
                : `Procure ${formatPrice(freeShippingThreshold - total)} for free shipment.`}
            </p>
            <div className="h-1 w-full bg-[#eee] overflow-hidden">
              <div
                className="h-full bg-[#ef4a23] transition-all duration-1000 ease-out shadow-[0_0_10px_#ef4a23]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Gear Cluster (Items Area) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
               <FiShoppingBag size={48} className="mb-6" />
               <h3 className="text-[12px] font-black uppercase tracking-[0.4em] italic mb-2">Manifest Null</h3>
               <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">No gear detected in active deployment bag.</p>
               <button
                 onClick={closeCart}
                 className="mt-10 px-8 py-3 border-2 border-[#081621] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#081621] hover:text-white transition-all italic"
               >
                 Initialize Shop
               </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.variant.sku} className="flex gap-4 group/item pb-6 border-b border-[#f1f1f1] last:border-none animate-in fade-in slide-in-from-right-4 duration-500">
                  {/* High-Key Asset */}
                  <div className="relative w-24 h-28 bg-[#f8f8f8] flex-shrink-0 border border-[#eee] overflow-hidden grayscale group-hover/item:grayscale-0 transition-all duration-500">
                    {item.productImage ? (
                      <Image
                        src={optimizeCloudinaryUrl(item.productImage, 200)}
                        alt={item.productName}
                        fill
                        className="object-contain p-2 group-hover/item:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#ddd]"><FiBox size={32} /></div>
                    )}
                  </div>

                  {/* Operational Info */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <Link
                        href={`/product/${item.productSlug}`}
                        onClick={closeCart}
                        className="text-[13px] font-[1000] text-[#081621] leading-none uppercase italic tracking-tighter truncate group-hover/item:text-[#ef4a23] transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <button onClick={() => removeItem(item.variant.sku)} className="text-[#081621]/10 hover:text-[#ef4a23] transition-colors p-1" title="Purge Item">
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-x-2 gap-y-1 mb-4">
                      {Object.entries(item.variant.combination).map(([key, value]) => (
                        <div key={key} className="text-[8px] font-black uppercase tracking-[0.2em] text-[#081621]/40 border border-[#eee] px-1.5 py-0.5 whitespace-nowrap">
                          {key}:{value}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Tactile Switcher */}
                      <div className="flex items-center border border-[#eee] bg-white group/qty">
                        <button
                          onClick={() => updateQuantity(item.variant.sku, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-[#081621] hover:bg-[#081621] hover:text-white disabled:opacity-5 transition-all text-sm"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-10 text-center text-[12px] font-black text-[#081621] italic">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variant.sku, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#081621] hover:bg-[#081621] hover:text-white transition-all text-sm"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      <span className="text-[15px] font-[1000] text-[#081621] italic">
                        ৳{item.variant.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Command Terminal (Actions) */}
        {items.length > 0 && (
          <div className="p-8 border-t-2 border-[#081621] bg-white">
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center text-[10px] font-black text-[#081621]/40 uppercase tracking-[0.3em] italic">
                <span>Total Merchandise</span>
                <span className="text-[#081621]">৳{total}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-[#081621]/40 uppercase tracking-[0.3em] italic">
                <span>Shipping Analytics</span>
                <span className={total >= freeShippingThreshold ? "text-emerald-500" : "text-[#081621]"}>
                  {total >= freeShippingThreshold ? "COMPLEMENTARY" : "CALCULATING NODE"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-5 border-t border-[#eee]">
                <span className="text-[14px] font-[1000] text-[#081621] uppercase italic tracking-[0.2em]">Estimated Net</span>
                <span className="text-3xl font-[1000] text-[#081621] italic leading-none">৳{total}</span>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/checkout" onClick={closeCart} className="block group">
                <button className="w-full h-16 bg-[#081621] hover:bg-[#ef4a23] text-white text-[13px] font-black uppercase italic tracking-[0.4em] transition-all flex items-center justify-center gap-4 cursor-pointer shadow-[20px_20px_0px_rgba(8,22,33,0.04)] active:scale-95 active:shadow-none">
                  Initiate Checkout <FiArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>

              <div className="flex justify-center">
                <button
                  onClick={clearCart}
                  className="text-[9px] font-black text-[#081621]/20 hover:text-[#ef4a23] uppercase tracking-[0.4em] italic transition-colors cursor-pointer"
                >
                  Purge Active Bag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
