"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiArrowLeft, FiBarChart2, FiBookmark, FiBox, FiChevronLeft,
  FiDatabase, FiGift, FiGrid, FiMenu, FiShoppingCart,
  FiSliders, FiStar, FiTag, FiTrash2, FiUsers, FiZap, FiX,
} from "react-icons/fi";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: FiGrid, exact: true },
  { href: "/admin/orders", label: "Orders", icon: FiShoppingCart },
  { href: "/admin/products", label: "Products", icon: FiBox },
  { href: "/admin/categories", label: "Categories", icon: FiTag },
  { href: "/admin/brands", label: "Brands", icon: FiBookmark },
  { href: "/admin/attributes", label: "Attributes", icon: FiSliders },
  { href: "/admin/users", label: "Users", icon: FiUsers },
  { href: "/admin/deals", label: "Deals", icon: FiZap },
  { href: "/admin/coupons", label: "Coupons", icon: FiGift },
  { href: "/admin/reviews", label: "Reviews", icon: FiStar },
  { href: "/admin/inventory", label: "Inventory", icon: FiDatabase },
  { href: "/admin/analytics", label: "Analytics", icon: FiBarChart2 },
  { href: "/admin/recycle-bin", label: "Recycle Bin", icon: FiTrash2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#ef4a23] flex items-center justify-center">
            <span className="text-white text-sm font-black italic">V</span>
          </div>
          <div className="leading-none">
            <span className="text-[13px] font-bold text-white block tracking-tight">VELOCITY</span>
            <span className="text-[9px] text-white/30 font-semibold uppercase tracking-[0.15em]">Admin Console</span>
          </div>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/40 hover:text-white">
          <FiX size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all group",
                isActive
                  ? "bg-[#ef4a23] text-white"
                  : "text-white/40 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Icon size={17} className={isActive ? "text-white" : "text-white/30 group-hover:text-white/60"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to Store */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/30 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <FiArrowLeft size={17} />
          Back to Store
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#111119] border border-white/10 flex items-center justify-center text-white/60"
      >
        <FiMenu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-[#111119] border-r border-white/[0.06] z-10">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 bg-[#111119] border-r border-white/[0.06] min-h-screen shrink-0">
        {sidebar}
      </aside>
    </>
  );
}
