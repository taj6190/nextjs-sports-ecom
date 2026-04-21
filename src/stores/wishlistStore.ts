import { create } from "zustand";
import type { WishlistStore } from "@/types";

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  items: [],
  isLoaded: false,
  isFetching: false,

  setItems: (items: string[]) => set({ items, isLoaded: true }),

  toggleItem: async (productId: string) => {
    // Optimistic update
    const currentItems = get().items;
    const exists = currentItems.includes(productId);
    const newItems = exists
      ? currentItems.filter((id) => id !== productId)
      : [...currentItems, productId];
    set({ items: newItems });

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();
      if (json.success) {
        set({ items: json.data });
      } else {
        // Revert on failure
        set({ items: currentItems });
      }
    } catch {
      set({ items: currentItems });
    }
  },

  hasItem: (productId: string) => get().items.includes(productId),

  syncFromServer: async () => {
    const { isLoaded, isFetching } = get();
    if (isLoaded || isFetching) return;
    
    set({ isFetching: true });
    try {
      const res = await fetch("/api/wishlist");
      const json = await res.json();
      if (json.success) {
        set({ items: json.data, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    } finally {
      set({ isFetching: false });
    }
  },
}));
