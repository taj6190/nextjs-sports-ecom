"use client";

import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import type { ICategory } from "@/types";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiHeart, FiLogOut, FiMenu, FiSearch, FiSettings, FiShoppingCart, FiUser } from "react-icons/fi";
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
  const { items: wishlistItems, syncFromServer: syncWishlist } = useWishlistStore();
  const searchRef = useRef<HTMLDivElement>(null);

  // Fix hydration mismatch by holding client-side values in state
  const [isClient, setIsClient] = useState(false);
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    setIsClient(true);
    if (session?.user) {
      syncWishlist();
    }
  }, [session, syncWishlist]);

  useEffect(() => {
    fetch("/api/categories?tree=true")
      .then((r) => r.json())
      .then((d) => d.success && setCategoryTree(d.data));
  }, []);

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

  // Close search results when clicking outside
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
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center h-[72px]">
            {/* Left Group: Logo & Nav */}
            <div className="flex items-center gap-14 flex-1">
              <Link href="/" className="flex items-center group shrink-0">
                <span className="text-3xl font-black text-[#111111] tracking-tighter italic">
                  VELOCITY
                </span>
              </Link>

              {/* Desktop Nav - Left Aligned */}
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/shop" className="py-2 text-[15px] font-bold text-[#111111] hover:text-[#ef4a23] transition-colors uppercase tracking-tight">
                  Shop All
                </Link>
                <Link href="/shop?sort=newest" className="py-2 text-[15px] font-bold text-[#111111] hover:text-[#ef4a23] transition-colors uppercase tracking-tight">
                  New Releases
                </Link>
                <Link
                  href="/deals"
                  className="flex items-center gap-1 py-2 text-[15px] font-bold text-red-600 hover:opacity-70 transition-opacity uppercase tracking-tight"
                >
                  Sale
                </Link>
              </nav>
            </div>

            {/* Right Actions - Right */}
            <div className="flex items-center gap-3 shrink-0 ml-auto">
              
              {/* Desktop Search Bar */}
              <div ref={searchRef} className="hidden md:flex relative group-search">
                  <div className="relative w-[180px] focus-within:w-[280px] transition-all duration-500 ease-out">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FiSearch className="text-[#111] opacity-50" size={17} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery && setShowResults(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                          window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-200/70 border border-transparent focus:border-slate-300 focus:bg-white text-[14px] text-[#111111] placeholder-slate-500 focus:outline-none transition-all duration-300"
                    />
                    
                    {/* AJAX Results Dropdown */}
                    {showResults && (
                      <div className="absolute top-[calc(100%+8px)] right-0 w-[350px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                        <div className="p-2 border-b border-slate-50 flex items-center justify-between px-4 bg-slate-50/50">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Products Found</span>
                          {isSearching && <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                          {searchResults.length > 0 ? (
                            searchResults.map((product) => (
                              <Link
                                key={product._id}
                                href={`/product/${product.slug}`}
                                onClick={() => setShowResults(false)}
                                className="flex items-center gap-4 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none"
                              >
                                <div className="w-12 h-12 bg-slate-50 shrink-0 overflow-hidden">
                                  <img src={product.images[0]?.url} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[13px] font-bold text-[#111] truncate">{product.name}</h4>
                                  <p className="text-[12px] text-slate-500 font-medium">${product.basePrice}</p>
                                </div>
                              </Link>
                            ))
                          ) : !isSearching ? (
                            <div className="p-8 text-center">
                              <p className="text-[13px] text-slate-500 font-medium">No matches for "{searchQuery}"</p>
                            </div>
                          ) : null}
                        </div>
                        {searchResults.length > 0 && (
                          <Link 
                            href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setShowResults(false)}
                            className="block p-3 text-center text-[12px] font-bold uppercase tracking-widest bg-slate-900 text-white hover:bg-black transition-colors"
                          >
                            View All {searchQuery}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
              </div>

              {/* Mobile Search Icon */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 text-[#111111] hover:opacity-70 transition-opacity cursor-pointer"
              >
                <FiSearch size={22} />
              </button>

              {/* Wishlist */}
              {session && (
                <Link
                  href="/account/wishlist"
                  className="hidden sm:flex relative p-2 text-[#111111] hover:opacity-70 transition-opacity"
                  title="Wishlist"
                >
                  <FiHeart size={22} />
                  {isClient && wishlistItems.length > 0 && (
                    <span className="absolute top-1 right-0 translate-x-1/3 -translate-y-1/3 min-w-[18px] h-[18px] bg-[#111111] text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-[#111111] hover:opacity-70 transition-opacity cursor-pointer"
                title="Bag"
              >
                <FiShoppingCart size={22} />
                {isClient && cartItemCount > 0 && (
                  <span className="absolute top-1 right-0 translate-x-1/3 -translate-y-1/3 min-w-[18px] h-[18px] bg-[#111111] text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Auth */}
              {session ? (
                <div className="hidden md:flex items-center ml-2 border-l border-slate-200 pl-4 gap-2">
                  {isAdmin && (
                    <Link href="/admin" className="p-2 text-[#111111] hover:opacity-70 transition-opacity" aria-label="Admin Dashboard">
                      <FiSettings size={20} />
                    </Link>
                  )}
                  <Link href="/account" className="p-2 text-[#111111] hover:opacity-70 transition-opacity" aria-label="My Account">
                    <FiUser size={20} />
                  </Link>
                  <button onClick={() => signOut()} className="p-2 text-[#111111] hover:opacity-70 transition-opacity cursor-pointer" aria-label="Sign Out">
                    <FiLogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:inline-flex px-6 py-2.5 ml-2 bg-[#111111] hover:bg-slate-800 text-white rounded-full text-[14px] font-bold transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-2 text-[#111111] hover:opacity-70 transition-opacity cursor-pointer"
              >
                <FiMenu size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Dropdown */}
          {searchOpen && (
            <div className="md:hidden pb-4 pt-2">
              <div className="flex w-full relative">
                <input
                  type="text"
                  placeholder="Search gear..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="w-full px-5 py-3.5 bg-slate-100 rounded-xl text-[15px] text-[#111111] placeholder-slate-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Categories Secondary Nav */}
        <div className="hidden md:block bg-white border-t border-slate-100">
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="flex items-center justify-center gap-10 h-11">
              {categoryTree.map((cat) => (
                <div key={cat._id} className="relative group/nav h-full">
                  <Link
                    href={`/shop?category=${cat._id}`}
                    className="flex items-center h-full text-[12px] font-bold uppercase tracking-[0.15em] text-[#111] hover:opacity-100 opacity-70 transition-all border-b-2 border-transparent group-hover/nav:border-black group-hover/nav:opacity-100"
                  >
                    {cat.name}
                  </Link>
                  
                  {cat.children && cat.children.length > 0 && (
                    <div className="absolute top-full left-0 bg-white border border-slate-200 shadow-[0_15px_30px_rgba(0,0,0,0.1)] min-w-[220px] opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-50 translate-y-1 group-hover/nav:translate-y-0">
                      <div className="py-3">
                        {cat.children.map((sub) => (
                          <Link
                            key={sub._id}
                            href={`/shop?category=${sub._id}`}
                            className="block px-6 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-black transition-colors"
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
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <CartDrawer />
    </>
  );
}
