"use client";

import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import type { ICategory } from "@/types";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiHeart, FiLogOut, FiMenu, FiSearch, FiSettings, FiShoppingCart, FiUser } from "react-icons/fi";
import CartDrawer from "../cart/CartDrawer";
import MobileNav from "./MobileNav";

export default function Header() {
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryTree, setCategoryTree] = useState<(ICategory & { children?: ICategory[] })[]>([]);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { items: wishlistItems, syncFromServer: syncWishlist } = useWishlistStore();

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center group shrink-0 pr-6">
              <span className="text-3xl font-black text-[#111111] tracking-tighter italic">
                VELOCITY
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/shop" className="py-2 text-[15px] font-bold text-[#111111] hover:opacity-70 transition-opacity">
                New Releases
              </Link>
              {categoryTree.slice(0, 3).map(cat => (
                <Link key={cat._id} href={`/shop?category=${cat._id}`} className="py-2 text-[15px] font-bold text-[#111111] hover:opacity-70 transition-opacity">
                  {cat.name}
                </Link>
              ))}

              {/* Categories Dropdown */}
              <div className="relative group/cat" ref={dropdownRef}>
                <button
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                  onMouseEnter={() => setCatDropdownOpen(true)}
                  className="flex items-center gap-1.5 py-2 text-[15px] font-bold text-[#111111] hover:opacity-70 transition-opacity cursor-pointer"
                >
                  All Gear <FiChevronDown size={16} className={`transition-transform duration-300 ${catDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {catDropdownOpen && categoryTree.length > 0 && (
                  <div 
                    onMouseLeave={() => setCatDropdownOpen(false)}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-[1px] min-w-[500px] w-max max-w-[800px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8 animate-fade-in z-50 flex gap-8 rounded-b-xl border border-slate-100"
                  >
                    <div className="w-1/3 border-r border-slate-100 pr-8 space-y-2">
                      {categoryTree.map((cat) => (
                        <Link
                            key={cat._id}
                            href={`/shop?category=${cat._id}`}
                            onClick={() => setCatDropdownOpen(false)}
                            className="flex items-center gap-3 py-2 text-[15px] font-medium text-slate-800 hover:text-[#111111] transition-colors"
                          >
                            {cat.name}
                        </Link>
                      ))}
                    </div>
                    <div className="w-2/3 grid grid-cols-2 gap-x-8 gap-y-8 content-start">
                         {categoryTree.map((cat) => (
                             cat.children && cat.children.length > 0 ? (
                                <div key={`sub-${cat._id}`} className="space-y-3">
                                  <p className="text-[15px] font-bold text-[#111111]">{cat.name}</p>
                                  <div className="flex flex-col space-y-2">
                                    {cat.children.map((sub) => (
                                      <Link
                                        key={sub._id}
                                        href={`/shop?category=${sub._id}`}
                                        onClick={() => setCatDropdownOpen(false)}
                                        className="text-[14px] font-medium text-slate-500 hover:text-[#111111] transition-colors"
                                      >
                                        {sub.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                             ) : null
                         ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sale */}
              <Link
                href="/deals"
                className="flex items-center gap-1 py-2 text-[15px] font-bold text-red-600 hover:opacity-70 transition-opacity ml-2"
              >
                Sale
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4 shrink-0 ml-auto">
              
              {/* Desktop Search Bar */}
              <div className="hidden md:flex relative w-[180px] group-search focus-within:w-[260px] transition-all duration-300">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-[#111] opacity-50" size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-[15px] text-[#111111] placeholder-slate-500 focus:outline-none focus:bg-slate-200 transition-colors"
                  />
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
      </header>

      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <CartDrawer />
    </>
  );
}
