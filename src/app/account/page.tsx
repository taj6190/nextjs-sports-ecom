import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiPackage, FiUser, FiMapPin, FiLogOut } from "react-icons/fi";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user;
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-[#F2F4F8]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">My Account</h1>

        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-slate-900 text-xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{user?.name}</h2>
              <p className="text-sm text-slate-600">{user?.email}</p>
              {isAdmin && (
                <span className="inline-flex mt-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/account/orders" className="p-5 bg-white shadow-sm border border-slate-200 rounded-2xl hover:border-slate-300 transition-all group">
            <FiPackage className="text-blue-400 mb-3" size={24} />
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-400 transition-colors">My Orders</h3>
            <p className="text-xs text-slate-500 mt-1">Track and manage your orders</p>
          </Link>
          <Link href="/account" className="p-5 bg-white shadow-sm border border-slate-200 rounded-2xl hover:border-slate-300 transition-all group">
            <FiUser className="text-emerald-400 mb-3" size={24} />
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-400 transition-colors">Profile</h3>
            <p className="text-xs text-slate-500 mt-1">Edit your profile info</p>
          </Link>
          <Link href="/account" className="p-5 bg-white shadow-sm border border-slate-200 rounded-2xl hover:border-slate-300 transition-all group">
            <FiMapPin className="text-amber-400 mb-3" size={24} />
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-amber-400 transition-colors">Addresses</h3>
            <p className="text-xs text-slate-500 mt-1">Manage shipping addresses</p>
          </Link>
          {isAdmin && (
            <Link href="/admin" className="p-5 bg-white shadow-sm border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all group">
              <FiLogOut className="text-purple-400 mb-3" size={24} />
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-purple-400 transition-colors">Admin Panel</h3>
              <p className="text-xs text-slate-500 mt-1">Manage products and orders</p>
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
