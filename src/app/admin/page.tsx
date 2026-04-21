"use client";

import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FiAlertTriangle, FiBarChart2, FiBox, FiDollarSign, FiShoppingCart, FiTrendingUp } from "react-icons/fi";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  lastMonthRevenue: number;
  todayRevenue: number;
  todayOrders: number;
  revenueByProduct: { _id: string; productName: string; totalRevenue: number; totalQuantity: number; orderCount: number }[];
  revenueByCategory: { _id: string; categoryName: string; categoryIcon: string; totalRevenue: number; totalQuantity: number }[];
  topProducts: { _id: string; name: string; images: { url: string }[]; basePrice: number; purchaseCount: number }[];
  ordersByStatus: Record<string, number>;
  dailyRevenue: { _id: string; revenue: number; orders: number }[];
  totalCategories: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lowStock, setLowStock] = useState<{ _id: string; name: string; totalStock: number }[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then(r => r.json()),
      fetch("/api/products?limit=100").then(r => r.json()),
    ]).then(([analytics, products]) => {
      if (analytics.success) setData(analytics.data);
      if (products.success) {
        setTotalProducts(products.pagination?.total || 0);
        const low = (products.data || []).filter((p: { totalStock: number }) => p.totalStock <= 5);
        setLowStock(low.slice(0, 10));
      }
      setLoading(false);
    });
    // Get user count separately
    fetch("/api/orders?limit=1").then(r => r.json()).then(() => {
      setTotalUsers(0); // We don't have a user count endpoint, use analytics data
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-slate-500">Failed to load analytics.</p>;

  const revenueChange = data.lastMonthRevenue > 0
    ? Math.round(((data.monthlyRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100)
    : 100;

  const stats = [
    { label: "Total Revenue", value: formatPrice(data.totalRevenue), sub: `${formatPrice(data.todayRevenue)} today`, icon: FiDollarSign, color: "emerald", trend: `${revenueChange >= 0 ? "+" : ""}${revenueChange}% vs last month` },
    { label: "Total Orders", value: data.totalOrders.toString(), sub: `${data.todayOrders} today`, icon: FiShoppingCart, color: "blue", trend: `${data.monthlyOrders} this month` },
    { label: "Active Products", value: totalProducts.toString(), sub: `${lowStock.length} low stock`, icon: FiBox, color: "purple" },
    { label: "Monthly Revenue", value: formatPrice(data.monthlyRevenue), sub: `${data.monthlyOrders} orders`, icon: FiTrendingUp, color: "amber" },
  ];

  const statusColors: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-500/10",
    confirmed: "text-blue-400 bg-blue-500/10",
    processing: "text-indigo-400 bg-indigo-500/10",
    shipped: "text-cyan-400 bg-cyan-500/10",
    delivered: "text-emerald-400 bg-emerald-500/10",
    cancelled: "text-red-400 bg-red-500/10",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Advanced overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-400`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">{stat.sub}</span>
                {stat.trend && <span className="text-[10px] text-emerald-400">{stat.trend}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Status Distribution */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiBarChart2 className="text-blue-400" size={18} /> Order Status Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
            <div key={status} className={`p-3 rounded-xl text-center ${statusColors[status]}`}>
              <p className="text-2xl font-bold">{data.ordersByStatus[status] || 0}</p>
              <p className="text-xs capitalize mt-1 opacity-80">{status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Product - Top 10 */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-emerald-400" size={18} /> Revenue by Product
          </h2>
          {data.revenueByProduct.length > 0 ? (
            <div className="space-y-3">
              {data.revenueByProduct.map((item, i) => {
                const maxRev = data.revenueByProduct[0]?.totalRevenue || 1;
                const pct = Math.round((item.totalRevenue / maxRev) * 100);
                return (
                  <div key={item._id || i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium line-clamp-1 flex-1">{item.productName}</span>
                      <span className="text-slate-400 ml-2">{formatPrice(item.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 w-12 text-right">{item.totalQuantity} sold</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">No sales data yet</p>
          )}
        </div>

        {/* Revenue by Category */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-purple-400" size={18} /> Revenue by Category
          </h2>
          {data.revenueByCategory.length > 0 ? (
            <div className="space-y-3">
              {data.revenueByCategory.map((item, i) => {
                const maxRev = data.revenueByCategory[0]?.totalRevenue || 1;
                const pct = Math.round((item.totalRevenue / maxRev) * 100);
                return (
                  <div key={item._id || i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium flex items-center gap-2">
                        <span>{item.categoryIcon || "📦"}</span>
                        {item.categoryName || "Unknown"}
                      </span>
                      <span className="text-slate-400">{formatPrice(item.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 w-12 text-right">{item.totalQuantity} sold</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">No sales data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart (last 30 days) */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-blue-400" size={18} /> Daily Revenue (30 Days)
          </h2>
          {data.dailyRevenue.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-end gap-1 h-40">
                {data.dailyRevenue.map((day, i) => {
                  const maxRev = Math.max(...data.dailyRevenue.map(d => d.revenue)) || 1;
                  const height = Math.max(4, (day.revenue / maxRev) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                        <div className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-white whitespace-nowrap">
                          {formatPrice(day.revenue)} • {day.orders} orders
                          <br />{day._id}
                        </div>
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-500 hover:to-blue-300 transition-colors cursor-pointer"
                        style={{ height: `${height}%`, minHeight: "4px" }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>{data.dailyRevenue[0]?._id}</span>
                <span>{data.dailyRevenue[data.dailyRevenue.length - 1]?._id}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">No data yet</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiAlertTriangle className="text-amber-400" size={18} /> Low Stock Alerts
          </h2>
          {lowStock.length > 0 ? (
            <div className="space-y-3">
              {lowStock.map((product) => (
                <div key={String(product._id)} className="flex items-center justify-between p-3 bg-slate-800/20 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-white">{product.name}</p>
                  </div>
                  <Badge variant={product.totalStock === 0 ? "danger" : "warning"}>
                    {product.totalStock} in stock
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">All products are well stocked ✓</p>
          )}
        </div>
      </div>
    </div>
  );
}
