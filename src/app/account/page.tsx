"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FiActivity, FiArrowRight, FiLogOut, FiMapPin, FiPackage, FiSettings, FiUser } from "react-icons/fi";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#eee] border-t-[#ef4a23] animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#081621]/40">Securing Session...</span>
         </div>
      </div>
    );
  }

  if (!session) return null;

  const user = session.user;
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-white select-none">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-16">

        {/* Terminal Header */}
        <div className="flex flex-col mb-12">
           <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 bg-[#ef4a23] rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#081621]/40">System // Personnel Terminal</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-[1000] text-[#081621] uppercase italic tracking-tighter leading-none">
             UNIT IDENT: <span className="text-[#ef4a23]">{user?.name?.split(' ')[0]}</span>
           </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Column 1: Core ID Card */}
          <div className="lg:col-span-4">
             <div className="border-2 border-[#081621] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <FiUser size={120} />
                </div>
                <div className="relative z-10">
                   <div className="w-20 h-20 bg-[#081621] text-white flex items-center justify-center text-3xl font-[1000] mb-6 italic">
                      {user?.name?.[0]?.toUpperCase()}
                   </div>
                   <h2 className="text-xl font-black text-[#081621] uppercase italic tracking-tight mb-1">{user?.name}</h2>
                   <p className="text-[11px] font-bold text-[#081621]/60 uppercase tracking-widest mb-6">{user?.email}</p>

                   <div className="space-y-4 pt-6 border-t border-[#eee]">
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black uppercase tracking-widest text-[#999]">Operational Status</span>
                         <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Active Node
                         </span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black uppercase tracking-widest text-[#999]">Security Clearance</span>
                         <span className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? "text-[#ef4a23]" : "text-[#081621]"}`}>
                            {isAdmin ? "L-01 Admin" : "Standard User"}
                         </span>
                      </div>
                   </div>
                </div>
             </div>

             <button
               onClick={() => signOut({ callbackUrl: "/" })}
               className="mt-6 flex items-center justify-center gap-3 w-full py-5 border-2 border-[#eee] text-[#081621] text-[11px] font-black uppercase italic tracking-[0.2em] hover:bg-[#081621] hover:text-white hover:border-[#081621] transition-all cursor-pointer"
             >
                <FiLogOut /> Log out
             </button>
          </div>

          {/* Column 2: Tactical Nav Grids */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Node: Orders */}
                <Link href="/account/orders" className="group border-2 border-[#eee] hover:border-[#081621] p-8 transition-all relative">
                   <div className="absolute top-4 right-4 text-[10px] font-black text-[#eee] group-hover:text-[#081621]/10 transition-colors uppercase tracking-widest italic">Node // 01</div>
                   <FiPackage className="text-[#081621] mb-6 group-hover:text-[#ef4a23] transition-colors" size={32} />
                   <h3 className="text-xl font-black text-[#081621] uppercase italic tracking-tighter mb-2">My Orders</h3>
                   <p className="text-[11px] font-bold text-[#081621]/40 uppercase tracking-widest leading-relaxed mb-6">Track deployment status and procurement history</p>
                   <div className="flex items-center gap-2 text-[10px] font-black text-[#ef4a23] uppercase italic group-hover:translate-x-2 transition-transform">
                      Open Log <FiArrowRight />
                   </div>
                </Link>

                {/* Node: Profile */}
                <Link href="/account/profile" className="group border-2 border-[#eee] hover:border-[#081621] p-8 transition-all relative">
                   <div className="absolute top-4 right-4 text-[10px] font-black text-[#eee] group-hover:text-[#081621]/10 transition-colors uppercase tracking-widest italic">Node // 02</div>
                   <FiUser className="text-[#081621] mb-6 group-hover:text-[#ef4a23] transition-colors" size={32} />
                   <h3 className="text-xl font-black text-[#081621] uppercase italic tracking-tighter mb-2">My Profile</h3>
                   <p className="text-[11px] font-bold text-[#081621]/40 uppercase tracking-widest leading-relaxed mb-6">Modify core identification and biometric data</p>
                   <div className="flex items-center gap-2 text-[10px] font-black text-[#ef4a23] uppercase italic group-hover:translate-x-2 transition-transform">
                      Access Data <FiArrowRight />
                   </div>
                </Link>

                {/* Node: Security/Admin */}
                {isAdmin ? (
                  <Link href="/admin" className="group border-2 border-[#081621]/10 hover:border-[#ef4a23] p-8 transition-all relative bg-[#081621]/5">
                     <div className="absolute top-4 right-4 text-[10px] font-black text-[#081621]/10 uppercase tracking-widest italic">High Clearance</div>
                     <FiSettings className="text-[#081621] mb-6 group-hover:text-[#ef4a23] transition-colors" size={32} />
                     <h3 className="text-xl font-black text-[#081621] uppercase italic tracking-tighter mb-2">Admin Panel</h3>
                     <p className="text-[11px] font-bold text-[#081621]/40 uppercase tracking-widest leading-relaxed mb-6">Execute platform wide inventory and logistics control</p>
                     <div className="flex items-center gap-2 text-[10px] font-black text-[#ef4a23] uppercase italic group-hover:translate-x-2 transition-transform">
                        Launch Terminal <FiArrowRight />
                     </div>
                  </Link>
                ) : (
                  <Link href="/account" className="group border-2 border-[#eee] hover:border-[#081621] p-8 transition-all relative">
                     <div className="absolute top-4 right-4 text-[10px] font-black text-[#eee] group-hover:text-[#081621]/10 transition-colors uppercase tracking-widest italic">Node // 03</div>
                     <FiMapPin className="text-[#081621] mb-6 group-hover:text-[#ef4a23] transition-colors" size={32} />
                     <h3 className="text-xl font-black text-[#081621] uppercase italic tracking-tighter mb-2">Tactical Range</h3>
                     <p className="text-[11px] font-bold text-[#081621]/40 uppercase tracking-widest leading-relaxed mb-6">Manage global logistics and shipping coordinates</p>
                     <div className="flex items-center gap-2 text-[10px] font-black text-[#ef4a23] uppercase italic group-hover:translate-x-2 transition-transform">
                        Manage Range <FiArrowRight />
                     </div>
                </Link>
                )}

                <div className="border-2 border-dashed border-[#eee] p-8 flex flex-col justify-center items-center text-center opacity-40">
                   <FiActivity className="text-[#081621] mb-4" size={24} />
                   <h3 className="text-[11px] font-black text-[#081621] uppercase italic tracking-widest">Upcoming Deployment</h3>
                   <span className="text-[8px] font-black text-[#999] uppercase tracking-[0.2em] mt-1">Telemetry Locked</span>
                </div>

             </div>

             {/* Dynamic Utility Strip */}
             <div className="bg-[#081621] p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] italic"></span>
                </div>
                <Link href="/shop" className="text-[10px] font-black text-white uppercase italic tracking-[0.2em] flex items-center gap-2 hover:text-[#ef4a23] transition-colors">
                   Continue To Shop <FiArrowRight />
                </Link>
             </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
