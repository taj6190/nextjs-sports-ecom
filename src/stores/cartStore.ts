import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartStore } from "@/types";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem: CartItem, preventOpen?: boolean) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.variant.sku === newItem.variant.sku
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const existing = updated[existingIndex];
            const newQty = Math.min(
              existing.quantity + newItem.quantity,
              existing.maxStock
            );
            updated[existingIndex] = { ...existing, quantity: newQty };
            return { items: updated, isOpen: preventOpen ? state.isOpen : true };
          }

          return { items: [...state.items, newItem], isOpen: preventOpen ? state.isOpen : true };
        });
      },

      removeItem: (sku: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.variant.sku !== sku),
        }));
      },

      updateQuantity: (sku: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.variant.sku === sku
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxStock)) }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0),
    }),
    {
      name: "electromart-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
