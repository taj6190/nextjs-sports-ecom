"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiArrowLeft,
    FiBarChart2,
    FiBookmark,
    FiBox,
    FiDatabase,
    FiGift,
    FiGrid,
    FiShoppingCart,
    FiSliders,
    FiStar,
    FiTag,
    FiTrash2,
    FiUsers,
    FiZap,
} from "react-icons/fi";
import { HiOutlineBolt } from "react-icons/hi2";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: FiGrid, exact: true },
  { href: "/admin/products", label: "Products", icon: FiBox },
  { href: "/admin/categories", label: "Categories", icon: FiTag },
  { href: "/admin/brands", label: "Brands", icon: FiBookmark },
  { href: "/admin/attributes", label: "Attributes", icon: FiSliders },
  { href: "/admin/orders", label: "Orders", icon: FiShoppingCart },
  { href: "/admin/users", label: "Users", icon: FiUsers },
  { href: "/admin/deals", label: "Today's Deals", icon: FiZap },
  { href: "/admin/coupons", label: "Coupons", icon: FiGift },
  { href: "/admin/reviews", label: "Reviews", icon: FiStar },
  { href: "/admin/inventory", label: "Inventory", icon: FiDatabase },
  { href: "/admin/analytics", label: "Analytics", icon: FiBarChart2 },
  { href: "/admin/recycle-bin", label: "Recycle Bin", icon: FiTrash2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <HiOutlineBolt className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">ElectroMart</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to Store */}
      <div className="p-3 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          <FiArrowLeft size={18} />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}
