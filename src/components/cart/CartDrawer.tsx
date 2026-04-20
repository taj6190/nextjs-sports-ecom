"use client";

import Image from "next/image";
import Link from "next/link";
import { FiX, FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiBox } from "react-icons/fi";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import Button from "../ui/Button";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCart} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FiShoppingBag className="text-blue-400" size={20} />
            <h2 className="text-lg font-semibold text-slate-900">Shopping Cart</h2>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">
              {items.length}
            </span>
          </div>
          <button onClick={closeCart} className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer">
            <FiX size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-slate-50 border-slate-200 rounded-2xl flex items-center justify-center mb-4">
                <FiShoppingBag className="text-slate-600" size={32} />
              </div>
              <p className="text-slate-600 font-medium">Your cart is empty</p>
              <p className="text-sm text-slate-600 mt-1">Browse our products and add items to your cart</p>
              <Link href="/shop" onClick={closeCart} className="mt-4 text-sm text-blue-400 hover:text-blue-300">
                Continue Shopping →
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variant.sku} className="flex gap-4 p-3 bg-slate-100 rounded-xl border border-slate-200">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <FiBox size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.productSlug}`} onClick={closeCart} className="text-sm font-medium text-slate-900 hover:text-blue-400 line-clamp-1">
                    {item.productName}
                  </Link>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(item.variant.combination).map(([key, value]) => (
                      <span key={key} className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-600 rounded">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.variant.sku, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/50 text-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm text-slate-900 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant.sku, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/50 text-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatPrice(item.variant.price * item.quantity)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.variant.sku)}
                  className="self-start p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="text-xl font-bold text-slate-900">{formatPrice(totalPrice())}</span>
            </div>
            <p className="text-xs text-slate-600">Shipping calculated at checkout</p>
            <div className="space-y-2">
              <Link href="/checkout" onClick={closeCart}>
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
              <button
                onClick={clearCart}
                className="w-full text-sm text-slate-500 hover:text-red-400 py-2 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
