"use client";

import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import type { ICategory } from "@/types";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiHeart, FiLogOut, FiMenu, FiSearch, FiSettings, FiShoppingCart, FiUser, FiMaximize } from "react-icons/fi";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import CartDrawer from "../cart/CartDrawer";
import MobileNav from "./MobileNav";

export default function Header() {
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [categoryTree, setCategoryTree] = useState<(ICategory & { children?: ICategory[] })[]>([]);
  
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const syncWishlist = useWishlistStore((s) => s.syncFromServer);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Fix hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin = session?.user?.role === "admin";
  const userId = session?.user?.id;

  useEffect(() => {
    setIsClient(true);
    if (userId) {
      syncWishlist();
    }
  }, [userId, syncWishlist]);

  useEffect(() => {
    if (categoryTree.length === 0) {
      fetch("/api/categories?tree=true")
        .then((r) => r.json())
        .then((d) => d.success && setCategoryTree(d.data));
    }
  }, [categoryTree.length]);

  // AJAX Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.data);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white select-none">
        {/* L1: The Core Bridge (Mobile Compact: 58px / Desktop: 76px) */}
        <div className="border-b border-[#eee]">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center h-[58px] md:h-[76px] justify-between">
            
            {/* Branding - Scaled for Precision */}
            <Link href="/" className="flex flex-col shrink-0 group">
              <span className="text-xl md:text-3xl font-[1000] text-[#081621] tracking-tighter italic uppercase leading-[0.8] transition-all group-hover:text-[#ef4a23]">
                VELOCITY
              </span>
              <span className="hidden md:block text-[7px] font-black tracking-[0.6em] text-[#081621]/30 uppercase mt-1">Tactical // Performance</span>
            </Link>

            {/* Redesigned Search Command */}
            <div className="hidden lg:flex flex-1 max-w-lg relative px-10" ref={searchRef}>
              <div className="relative w-full group/search">
                 <input
                   type="text"
                   placeholder="TARGET ACQUISITION // SEARCH GEAR"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onFocus={() => searchQuery && setShowResults(true)}
                   className="w-full h-10 bg-transparent border-b-2 border-[#eee] focus:border-[#ef4a23] py-2 text-[10px] font-black uppercase tracking-[0.25em] outline-none transition-all placeholder-[#ccc] focus:placeholder-[#081621]/20"
                 />
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 p-2 group-focus-within/search:text-[#ef4a23] transition-colors">
                    <FiSearch size={16} />
                 </div>
                 
                 {/* Intelligence Panel */}
                 {showResults && (searchResults.length > 0 || !isSearching) && (
                   <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white border-2 border-[#081621] shadow-[15px_15px_0px_rgba(8,22,33,0.08)] z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                     <div className="p-2.5 bg-[#081621] flex justify-between items-center text-white px-4">
                       <span className="text-[8px] font-black uppercase tracking-[0.3em] italic">Telemetry // Results</span>
                       {isSearching && <div className="w-2.5 h-2.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                     </div>
                     <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {searchResults.length > 0 ? (
                          searchResults.map((product) => (
                            <Link
                              key={product._id}
                              href={`/product/${product.slug}`}
                              onClick={() => setShowResults(false)}
                              className="flex items-center gap-4 p-3.5 hover:bg-[#fafafa] border-b border-[#f1f1f1] last:border-none transition-all group/item"
                            >
                              <div className="w-12 h-12 bg-white flex items-center justify-center p-0.5 border border-[#eee] shrink-0 grayscale group-hover/item:grayscale-0 transition-all">
                                <img src={optimizeCloudinaryUrl(product.images[0]?.url, 100)} alt={product.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-[1000] text-[#081621] uppercase italic leading-none truncate group-hover/item:text-[#ef4a23]">{product.name}</h4>
                                <p className="text-[10px] font-black text-[#ef4a23] mt-1.5 italic whitespace-nowrap">৳{product.basePrice.toLocaleString()}</p>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="p-10 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic">No Match Found: "{searchQuery}"</div>
                        )}
                     </div>
                   </div>
                 )}
              </div>
            </div>

            {/* Functional Matrix (Compressed) */}
            <div className="flex items-center gap-0.5 md:gap-1 pl-4">
               <button onClick={() => setSearchOpen(!searchOpen)} className="lg:hidden w-9 h-9 md:w-11 md:h-11 flex items-center justify-center text-[#081621] hover:bg-[#f8f8f8] active:scale-90 transition-all">
                  <FiSearch size={18} />
               </button>

               <div className="flex items-center">
                  <Link href="/account/wishlist" className="relative w-9 h-9 md:w-11 md:h-11 flex items-center justify-center text-[#081621] hover:bg-[#f8f8f8] active:scale-90 group">
                     <FiHeart size={18} className={wishlistCount > 0 ? "fill-[#ef4a23] text-[#ef4a23]" : ""} />
                     {isClient && wishlistCount > 0 && (
                       <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#ef4a23] text-white text-[7px] md:text-[9px] font-black flex items-center justify-center italic">
                         {wishlistCount}
                       </span>
                     )}
                  </Link>

                  <button onClick={openCart} className="relative w-9 h-9 md:w-11 md:h-11 flex items-center justify-center text-[#081621] hover:bg-[#f8f8f8] active:scale-90 cursor-pointer border-r border-[#eee] mr-0.5 pr-0.5 md:mr-1 md:pr-1">
                     <FiShoppingCart size={18} />
                     {isClient && cartItemCount > 0 && (
                       <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#081621] text-white text-[7px] md:text-[9px] font-black flex items-center justify-center italic">
                         {cartItemCount}
                       </span>
                     )}
                  </button>

                  <div className="flex items-center">
                    {session ? (
                      <div className="flex items-center">
                         <Link href="/account" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center text-[#081621] hover:bg-[#f8f8f8]">
                            <FiUser size={18} />
                         </Link>
                         {isAdmin && (
                           <Link href="/admin" className="hidden sm:flex w-11 h-11 items-center justify-center text-[#081621] hover:bg-[#f8f8f8]">
                              <FiSettings size={18} />
                           </Link>
                         )}
                         <button onClick={() => signOut()} className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center text-[#081621] hover:text-[#ef4a23] cursor-pointer">
                            <FiLogOut size={16} />
                         </button>
                      </div>
                    ) : (
                      <Link href="/login" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center text-[#081621] hover:bg-[#f8f8f8]">
                        <FiUser size={18} />
                      </Link>
                    )}
                  </div>

                  <button onClick={() => setMobileNavOpen(true)} className="md:hidden w-9 h-9 flex items-center justify-center text-[#081621] active:scale-90">
                     <FiMenu size={20} />
                  </button>
               </div>
            </div>
          </div>

          {searchOpen && (
            <div className="md:hidden p-3 border-t border-[#eee] bg-white animate-in slide-in-from-top-1">
               <div className="relative">
                  <input
                    type="text"
                    placeholder="ID ITEM // ENTER SEARCH"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className="w-full h-11 bg-[#f8f8f8] border-b-2 border-[#081621] px-4 pr-10 text-[11px] font-black uppercase italic outline-none"
                    autoFocus
                  />
                  <FiSearch size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#081621] opacity-40" />
               </div>
            </div>
          )}
        </div>

        {/* L2: Tactical Layer (Industrial Black Split) */}
        <div className="hidden md:block bg-[#081621]">
           <div className="max-w-[1400px] mx-auto px-8 flex items-center h-[42px] justify-between">
              <div className="flex items-center gap-10 h-full">
                {categoryTree.map((cat) => (
                  <div key={cat._id} className="relative group/nav h-full">
                    <Link
                      href={`/shop?category=${cat._id}`}
                      className="flex items-center h-full text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all italic border-b-2 border-transparent group-hover/nav:border-[#ef4a23]"
                    >
                      // {cat.name}
                    </Link>
                    
                    {cat.children && cat.children.length > 0 && (
                      <div className="absolute top-full left-0 bg-white border-2 border-[#081621] shadow-[15px_15px_0px_rgba(8,22,33,0.1)] min-w-[220px] opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 z-50">
                         <div className="py-2.5">
                            {cat.children.map((sub) => (
                              <Link
                                key={sub._id}
                                href={`/shop?category=${sub._id}`}
                                className="block px-6 py-2 text-[10px] font-black text-[#081621]/60 hover:bg-[#f8f8f8] hover:text-[#ef4a23] uppercase italic transition-colors tracking-widest"
                              >
                                {sub.name}
                              </Link>
                            ))}
                         </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center">
                <Link href="/deals" className="text-[#ef4a23] text-[9px] font-black uppercase italic tracking-[0.25em] flex items-center gap-2 hover:opacity-80 transition-all">
                   <span className="w-1.5 h-1.5 bg-[#ef4a23] rounded-full animate-pulse" />
                   Priority Deals
                </Link>
              </div>
           </div>
        </div>
      </header>

      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <CartDrawer />
    </>
  );
}
