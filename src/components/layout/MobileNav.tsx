"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FiX, FiHome, FiShoppingBag, FiUser, FiLogOut, FiSettings, FiPackage, FiChevronRight, FiSearch, FiChevronDown } from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi2";
import { useState, useEffect } from "react";
import type { ICategory } from "@/types";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [categoryTree, setCategoryTree] = useState<(ICategory & { children?: ICategory[] })[]>([]);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && categoryTree.length === 0) {
      fetch("/api/categories?tree=true")
        .then((r) => r.json())
        .then((d) => d.success && setCategoryTree(d.data));
    }
  }, [isOpen, categoryTree.length]);

  return (
    <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isOpen ? "visible" : "invisible pointer-events-none"}`}>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-[300px] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <span className="text-2xl font-black italic tracking-tighter text-[#111]">VELOCITY</span>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-800 hover:opacity-70 transition-opacity cursor-pointer">
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
          <div className="space-y-1 mb-8">
            <Link href="/" onClick={onClose} className="flex items-center justify-between px-4 py-3.5 text-[13px] font-bold uppercase tracking-[0.1em] text-[#111] bg-slate-50 border border-slate-100">
              <span className="flex items-center gap-3"><FiHome size={18} /> Home</span>
              <FiChevronRight size={14} className="opacity-30" />
            </Link>
            <Link href="/shop" onClick={onClose} className="flex items-center justify-between px-4 py-3.5 text-[13px] font-bold uppercase tracking-[0.1em] text-[#111] hover:bg-slate-50 transition-colors">
              <span className="flex items-center gap-3"><FiShoppingBag size={18} /> Shop All</span>
              <FiChevronRight size={14} className="opacity-30" />
            </Link>
            <Link href="/deals" onClick={onClose} className="flex items-center justify-between px-4 py-3.5 text-[13px] font-bold uppercase tracking-[0.1em] text-red-600 hover:bg-red-50 transition-colors">
              <span className="flex items-center gap-3"><HiOutlineFire size={18} /> Hot Deals</span>
              <FiChevronRight size={14} className="opacity-30" />
            </Link>
          </div>

          {/* Categories */}
          {categoryTree.length > 0 && (
            <div className="mb-8">
              <p className="px-4 mb-4 text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black">Browse Categories</p>
              <div className="space-y-1">
                {categoryTree.map((cat) => (
                  <div key={cat._id} className="border-b border-slate-50 last:border-none">
                    <div className="flex items-center">
                      <Link
                        href={`/shop?category=${cat._id}`}
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-[13px] font-bold uppercase tracking-tight text-[#111] hover:text-[#ef4a23]"
                      >
                        {cat.name}
                      </Link>
                      {cat.children && cat.children.length > 0 && (
                        <button
                          onClick={() => setExpandedCat(expandedCat === cat._id ? null : cat._id)}
                          className="px-4 py-3 text-slate-400 cursor-pointer"
                        >
                          <FiChevronDown
                            size={18}
                            className={`transition-transform duration-300 ${expandedCat === cat._id ? "rotate-180 text-[#111]" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                    {expandedCat === cat._id && cat.children && (
                      <div className="bg-slate-50/50 pb-2">
                        {cat.children.map((sub) => (
                          <Link
                            key={sub._id}
                            href={`/shop?category=${sub._id}`}
                            onClick={onClose}
                            className="block px-8 py-2.5 text-[12px] font-medium text-slate-500 hover:text-[#111] transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Links */}
          <div className="border-t border-slate-100 pt-6">
            <p className="px-4 mb-4 text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black">Account</p>
            {session ? (
              <div className="space-y-1">
                <Link href="/account" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-[13px] font-bold uppercase text-[#111] hover:bg-slate-50">
                  <FiUser size={18} className="opacity-50" /> My Profile
                </Link>
                <Link href="/account/orders" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-[13px] font-bold uppercase text-[#111] hover:bg-slate-50">
                  <FiPackage size={18} className="opacity-50" /> My Orders
                </Link>
                <Link href="/track-order" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-[13px] font-bold uppercase text-[#111] hover:bg-slate-50">
                  <FiSearch size={18} className="opacity-50" /> Track Order
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-[13px] font-bold uppercase text-blue-600 hover:bg-blue-50">
                    <FiSettings size={18} /> Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); onClose(); }}
                  className="flex items-center gap-3 w-full px-4 py-3 mt-4 text-[12px] font-bold uppercase text-slate-400 hover:text-red-600 transition-colors"
                >
                  <FiLogOut size={18} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-3">
                <Link href="/track-order" onClick={onClose} className="block w-full py-3.5 bg-slate-100 text-[#111] text-center font-bold text-[12px] uppercase tracking-widest hover:bg-slate-200 transition-colors">
                  Track Order
                </Link>
                <Link href="/login" onClick={onClose} className="block w-full py-3.5 bg-[#111] text-white text-center font-bold text-[12px] uppercase tracking-widest hover:bg-black transition-colors">
                  Sign In
                </Link>
                <Link href="/register" onClick={onClose} className="block w-full py-3.5 border border-[#111] text-[#111] text-center font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                  Join Velocity
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
