"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiX, FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiBox } from "react-icons/fi";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, optimizeCloudinaryUrl } from "@/lib/utils";
import Button from "../ui/Button";

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

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`} 
        onClick={closeCart} 
      />
      
      {/* Drawer Canvas */}
      <div className={`relative w-[60%] sm:w-[50%] md:w-[400px] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black tracking-widest text-slate-900 uppercase">Your Bag</h2>
            <div className="min-w-[20px] h-5 flex items-center justify-center bg-blue-600 text-[10px] font-bold text-white px-1.5 rounded-full">
              {items.length}
            </div>
          </div>
          <button 
            onClick={closeCart} 
            className="p-2 -mr-2 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Free Shipping Promo */}
        {items.length > 0 && (
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {totalPrice() >= 5000 
                ? "🎉 You've unlocked free delivery!" 
                : `Spend ${formatPrice(5000 - totalPrice())} more for free delivery`}
            </p>
            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, (totalPrice() / 5000) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Items Area */}
        <div className="flex-1 overflow-y-auto px-5 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center pb-20">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <FiShoppingBag className="text-slate-300" size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Everything is empty</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-[160px]">Looks like you haven't added anything here yet.</p>
              <button 
                onClick={closeCart}
                className="mt-6 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 underline underline-offset-4"
              >
                Go to Shop
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {items.map((item) => (
                <div key={item.variant.sku} className="py-5 flex gap-4 group">
                  {/* Thumb */}
                  <div className="relative w-16 h-20 bg-slate-50 flex-shrink-0 border border-slate-100 overflow-hidden">
                    {item.productImage ? (
                      <Image src={optimizeCloudinaryUrl(item.productImage, 150)} alt={item.productName} fill className="object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><FiBox size={20} /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start">
                      <Link 
                        href={`/product/${item.productSlug}`} 
                        onClick={closeCart}
                        className="text-[12px] font-bold text-slate-900 leading-tight hover:text-blue-600 truncate pr-2 uppercase tracking-tight"
                      >
                        {item.productName}
                      </Link>
                      <button onClick={() => removeItem(item.variant.sku)} className="text-slate-300 hover:text-rose-500 p-0.5" title="Remove">
                        <FiTrash2 size={12} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 opacity-60">
                      {Object.entries(item.variant.combination).map(([key, value]) => (
                        <span key={key} className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          {key}: {value}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Qty Switcher */}
                      <div className="flex items-center border border-slate-100 rounded bg-white overflow-hidden shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.variant.sku, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-5 h-5 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-20 transition-colors"
                        >
                          <FiMinus size={10} />
                        </button>
                        <span className="w-5 text-center text-[11px] font-bold text-slate-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.variant.sku, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
                        >
                          <FiPlus size={10} />
                        </button>
                      </div>

                      <span className="text-[13px] font-black text-slate-900">
                        {formatPrice(item.variant.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Area */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-white">
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                <span>Merchandise</span>
                <span className="text-slate-900">{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                <span>Shipping</span>
                <span className="text-slate-900">{totalPrice() >= 5000 ? "Complementary" : "Calculated next"}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <span className="text-[13px] font-black text-slate-900 uppercase">Estimated Total</span>
                <span className="text-xl font-black text-slate-900">{formatPrice(totalPrice())}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/checkout" onClick={closeCart} className="block">
                <button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer">
                  Initiate Checkout
                </button>
              </Link>
              <button 
                onClick={clearCart}
                className="w-full py-1 text-[9px] font-bold text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors cursor-pointer"
              >
                Reset Bag
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
