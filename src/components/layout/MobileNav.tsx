"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FiX, FiHome, FiShoppingBag, FiUser, FiLogOut, FiSettings, FiPackage, FiChevronRight, FiSearch, FiChevronDown, FiZap } from "react-icons/fi";
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
    <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${isOpen ? "visible" : "invisible pointer-events-none"}`}>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#081621]/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} 
        onClick={onClose} 
      />
      
      {/* Tactical Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-white transition-transform duration-300 ease-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ boxShadow: "20px 0 60px rgba(0,0,0,0.1)" }}
      >
        {/* Unit Header */}
        <div className="flex items-center justify-between p-5 bg-[#081621]">
          <div className="flex flex-col">
             <span className="text-xl font-black italic tracking-tighter text-white">VELOCITY</span>
             <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em]">Deployment Node v0.4</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Main Action Nodes */}
          <div className="p-4 space-y-1">
            <Link href="/" onClick={onClose} className="flex items-center justify-between px-4 py-4 text-[12px] font-black uppercase italic tracking-widest text-[#081621] bg-[#f8f8f8]">
              <span className="flex items-center gap-3"><FiHome size={16} /> Base // Home</span>
              <FiChevronRight size={14} className="opacity-30" />
            </Link>
            <Link href="/shop" onClick={onClose} className="flex items-center justify-between px-4 py-4 text-[12px] font-black uppercase italic tracking-widest text-[#081621] hover:bg-[#f8f8f8]">
              <span className="flex items-center gap-3"><FiShoppingBag size={16} /> Inventory // Shop</span>
              <FiChevronRight size={14} className="opacity-30" />
            </Link>
            <Link href="/deals" onClick={onClose} className="flex items-center justify-between px-4 py-4 text-[12px] font-black uppercase italic tracking-widest text-[#ef4a23] hover:bg-[#ef4a23]/5">
              <span className="flex items-center gap-3"><FiZap size={16} /> Flash // Deals</span>
              <FiChevronRight size={14} className="opacity-30" />
            </Link>
          </div>

          <div className="h-[2px] bg-[#f0f0f0] mx-4 my-2" />

          {/* Sectors (Categories) */}
          {categoryTree.length > 0 && (
            <div className="p-4 pt-2">
              <p className="px-4 mb-4 text-[9px] text-[#081621]/30 uppercase tracking-[0.3em] font-black italic">// Operational Sectors</p>
              <div className="space-y-1">
                {categoryTree.map((cat) => (
                  <div key={cat._id} className="border-b border-[#f1f1f1] last:border-none">
                    <div className="flex items-center">
                      <Link
                        href={`/shop?category=${cat._id}`}
                        onClick={onClose}
                        className="flex-1 px-4 py-4 text-[13px] font-black uppercase italic text-[#081621] hover:text-[#ef4a23] tracking-tight"
                      >
                        {cat.name}
                      </Link>
                      {cat.children && cat.children.length > 0 && (
                        <button
                          onClick={() => setExpandedCat(expandedCat === cat._id ? null : cat._id)}
                          className="px-4 py-4 text-slate-400 cursor-pointer"
                        >
                          <FiChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${expandedCat === cat._id ? "rotate-180 text-[#ef4a23]" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                    {expandedCat === cat._id && cat.children && (
                      <div className="bg-[#f8f8f8] py-2 border-l-4 border-[#081621]">
                        {cat.children.map((sub) => (
                          <Link
                            key={sub._id}
                            href={`/shop?category=${sub._id}`}
                            onClick={onClose}
                            className="block px-8 py-3 text-[11px] font-black text-[#081621]/60 hover:text-[#ef4a23] uppercase italic hover:bg-white transition-all"
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
        </div>

        {/* Personnel Terminal (Footer) */}
        <div className="p-6 bg-[#f8f8f8] border-t border-[#eee]">
            {session ? (
              <div className="space-y-1">
                <Link href="/account" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase italic text-[#081621] hover:bg-white transition-colors">
                  <FiUser size={16} className="opacity-40" /> My Profile
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase italic text-[#ef4a23] hover:bg-white transition-colors">
                    <FiSettings size={16} /> Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); onClose(); }}
                  className="flex items-center gap-3 w-full px-4 py-4 mt-4 text-[10px] font-black uppercase italic text-[#081621]/40 hover:text-[#ef4a23] transition-colors"
                >
                  <FiLogOut size={16} /> Terminate Session
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/login" onClick={onClose} className="block w-full py-4 bg-[#081621] text-white text-center font-black text-[11px] uppercase tracking-[0.2em] italic hover:bg-[#ef4a23] transition-all">
                  Authenticate Profile
                </Link>
                <Link href="/register" onClick={onClose} className="block w-full py-3.5 border-2 border-[#081621] text-[#081621] text-center font-black text-[10px] uppercase tracking-[0.2em] italic hover:bg-[#081621] hover:text-white transition-all">
                  Initialize New Node
                </Link>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
