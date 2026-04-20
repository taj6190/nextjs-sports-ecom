"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FiX, FiHome, FiShoppingBag, FiUser, FiLogOut, FiSettings, FiPackage, FiChevronDown } from "react-icons/fi";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <span className="text-lg font-semibold text-slate-900">Menu</span>
          <button onClick={onClose} className="p-2 text-slate-600 hover:text-slate-900 cursor-pointer">
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-tight text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all">
            <FiHome size={18} /> Home
          </Link>
          <Link href="/shop" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-tight text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all">
            <FiShoppingBag size={18} /> Shop
          </Link>
          <Link href="/deals" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-tight text-orange-600 hover:bg-orange-50 transition-all">
            <HiOutlineFire size={18} /> Today&apos;s Deals
          </Link>

          {/* Categories Section */}
          {categoryTree.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="px-4 py-2 text-[10px] text-slate-500 uppercase tracking-widest font-black">Categories</p>
              {categoryTree.map((cat) => (
                <div key={cat._id}>
                  <div className="flex items-center">
                    <Link
                      href={`/shop?category=${cat._id}`}
                      onClick={onClose}
                      className="flex-1 flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all"
                    >
                      <span className="text-base">{cat.icon || "📦"}</span>
                      {cat.name}
                    </Link>
                    {cat.children && cat.children.length > 0 && (
                      <button
                        onClick={() => setExpandedCat(expandedCat === cat._id ? null : cat._id)}
                        className="p-3 text-slate-400 hover:text-slate-900 cursor-pointer"
                      >
                        <FiChevronDown
                          size={14}
                          className={`transition-transform ${expandedCat === cat._id ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                  {expandedCat === cat._id && cat.children && (
                    <div className="ml-12 space-y-0.5 mb-2">
                      {cat.children.map((sub) => (
                        <Link
                          key={sub._id}
                          href={`/shop?category=${sub._id}`}
                          onClick={onClose}
                          className="block px-3 py-2 text-xs font-medium text-slate-500 hover:text-blue-600 transition-all"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {session ? (
            <>
              <div className="pt-3 border-t border-slate-100">
                <Link href="/account" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase text-slate-700 hover:text-blue-600 transition-all">
                  <FiUser size={18} /> My Account
                </Link>
                <Link href="/account/orders" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase text-slate-700 hover:text-blue-600 transition-all">
                  <FiPackage size={18} /> My Orders
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase text-blue-600 transition-all">
                    <FiSettings size={18} /> Admin Panel
                  </Link>
                )}
              </div>
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => { signOut(); onClose(); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold uppercase text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <FiLogOut size={18} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-100 space-y-2 px-4">
              <Link href="/login" onClick={onClose} className="block w-full py-3 bg-blue-600 text-white text-center font-bold text-xs uppercase tracking-tight">
                Sign In
              </Link>
              <Link href="/register" onClick={onClose} className="block w-full py-3 border border-slate-300 text-slate-700 text-center font-bold text-xs uppercase tracking-tight hover:bg-slate-50">
                Create Account
              </Link>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
