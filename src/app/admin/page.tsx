"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { FiAlertTriangle, FiBarChart2, FiBox, FiDollarSign, FiShoppingCart, FiTrendingUp, FiUsers } from "react-icons/fi";

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
      fetch("/api/admin/users").then(r => r.json()), // Try fetching users if the endpoint exists and is authorized
    ]).then(([analytics, products, users]) => {
      if (analytics.success) setData(analytics.data);
      if (products.success) {
        setTotalProducts(products.pagination?.total || 0);
        const low = (products.data || []).filter((p: { totalStock: number }) => p.totalStock <= 5);
        setLowStock(low.slice(0, 10));
      }
      if (users && users.success) {
         setTotalUsers(users.data?.length || 0);
      }
      setLoading(false);
    }).catch(() => {
       setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/5 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 border border-white/10 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-white/40 text-[11px] uppercase tracking-widest font-bold">Failed to load telemetry.</p>;

  const stats = [
    { label: "Global Revenue", value: formatPrice(data.totalRevenue), sub: `${formatPrice(data.todayRevenue)} Today`, icon: FiDollarSign, color: "text-[#ef4a23]" },
    { label: "Total Deployments", value: data.totalOrders.toString(), sub: `${data.todayOrders} Today`, icon: FiShoppingCart, color: "text-white" },
    { label: "Active Assets", value: totalProducts.toString(), sub: `${lowStock.length} Critical Status`, icon: FiBox, color: "text-white" },
    { label: "Personnel Units", value: totalUsers.toString(), sub: "Velocity Squad", icon: FiUsers, color: "text-[#ef4a23]" },
  ];

  const statusColors: Record<string, string> = {
    pending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    confirmed: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    processing: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    shipped: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    delivered: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    cancelled: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-[#ef4a23]" />
            <h2 className="text-[10px] font-black tracking-[0.4em] text-[#ef4a23] uppercase italic">Central Command</h2>
        </div>
        <h1 className="text-3xl lg:text-4xl font-[1000] text-white tracking-tighter uppercase italic">
          Network <span className="text-white/20">Overview</span>
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[#111119] border border-white/[0.06] p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ef4a23]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">{stat.label}</span>
                 <Icon size={16} className={stat.color} />
              </div>
              <p className="text-3xl font-[1000] text-white tracking-tighter mb-2 italic">
                 {stat.value}
              </p>
              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-white/30">
                 <span>{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deployment Status */}
      <div className="bg-[#111119] border border-white/[0.06] p-6">
         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
            <FiBarChart2 size={16} className="text-[#ef4a23]" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Fulfillment Matrix</h3>
         </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
              <div key={status} className={`p-4 border text-center transition-all ${statusColors[status]}`}>
                <p className="text-2xl font-[1000] italic mb-1">{data.ordersByStatus[status] || 0}</p>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-80">{status}</p>
              </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         
         {/* Asset Telemetry Top 10 */}
         <div className="bg-[#111119] border border-white/[0.06] p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
               <FiTrendingUp size={16} className="text-[#ef4a23]" />
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Asset Performance</h3>
            </div>
            {data.revenueByProduct.length > 0 ? (
               <div className="space-y-5">
                  {data.revenueByProduct.map((item, i) => {
                     const maxRev = data.revenueByProduct[0]?.totalRevenue || 1;
                     const pct = Math.round((item.totalRevenue / maxRev) * 100);
                     return (
                        <div key={item._id || i} className="group">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[11px] font-bold text-white uppercase truncate pr-4">{item.productName}</span>
                              <span className="text-[11px] font-black text-[#ef4a23] italic whitespace-nowrap">{formatPrice(item.totalRevenue)}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-white/[0.04]">
                                 <div className="h-full bg-white/80 transition-all duration-1000" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest w-16 text-right">
                                 {item.totalQuantity} Sold
                              </span>
                           </div>
                        </div>
                     )
                  })}
               </div>
            ) : (
               <div className="py-10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">No telemetry data</div>
            )}
         </div>

         {/* Sector Performance */}
         <div className="space-y-6">
            
            <div className="bg-[#111119] border border-white/[0.06] p-6">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
                  <FiBox size={16} className="text-[#ef4a23]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Sector Performance</h3>
               </div>
               {data.revenueByCategory.length > 0 ? (
                  <div className="space-y-5">
                     {data.revenueByCategory.map((item, i) => {
                        const maxRev = data.revenueByCategory[0]?.totalRevenue || 1;
                        const pct = Math.round((item.totalRevenue / maxRev) * 100);
                        return (
                           <div key={item._id || i}>
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-[11px] font-bold text-white flex items-center gap-2 uppercase">
                                    <span className="text-white/40">{item.categoryIcon || "//"}</span> {item.categoryName || "Unknown"}
                                 </span>
                                 <span className="text-[11px] font-black text-white/60 italic">{formatPrice(item.totalRevenue)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="flex-1 h-1.5 bg-white/[0.04]">
                                    <div className="h-full bg-[#ef4a23] transition-all duration-1000" style={{ width: `${pct}%` }} />
                                 </div>
                                 <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest w-16 text-right">
                                    {item.totalQuantity} Sold
                                 </span>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               ) : (
                  <div className="py-10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">No telemetry data</div>
               )}
            </div>

            {/* Critical Asset Alerts */}
            <div className="bg-[#111119] border border-white/[0.06] p-6">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
                  <FiAlertTriangle size={16} className="text-amber-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Critical Asset Alerts</h3>
               </div>
               {lowStock.length > 0 ? (
                  <div className="space-y-3">
                     {lowStock.map((product) => (
                        <div key={String(product._id)} className="flex items-center justify-between p-3 border border-white/[0.04] bg-white/[0.02]">
                           <span className="text-[11px] font-bold text-white uppercase truncate pr-4">{product.name}</span>
                           <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest border ${
                              product.totalStock === 0 
                                 ? "text-red-500 border-red-500/30 bg-red-500/10" 
                                 : "text-amber-500 border-amber-500/30 bg-amber-500/10"
                           }`}>
                              {product.totalStock} IN STOCK
                           </span>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="py-8 text-center text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 italic">Assets Nominal</div>
               )}
            </div>

         </div>

      </div>
    </div>
  );
}
