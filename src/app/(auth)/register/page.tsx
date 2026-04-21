"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiUser, FiMail, FiPhone, FiLock, FiChevronRight, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Welcome to Velocity! Please sign in.");
        router.push("/login");
      } else {
        toast.error(json.error || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F8] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background with texture/overlay */}
      <div 
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
            backgroundImage: `url('/sports_light_auth_bg_1776753484363.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
      />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none appearance-none" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block mb-8">
            <span className="text-4xl font-black text-[#081621] italic tracking-tighter hover:text-[#ef4a23] transition-colors uppercase">
              VELOCITY
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[#081621] uppercase tracking-wider mb-2">Join the Squad</h1>
          <div className="h-1 w-12 bg-[#ef4a23] mx-auto" />
        </div>

        <div className="bg-white border border-[#eee] shadow-[0_15px_40px_rgba(0,0,0,0.05)] p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ef4a23] transition-colors" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 bg-[#f8f9fa] border border-[#eee] pl-12 pr-4 text-[#111] text-sm focus:outline-none focus:border-[#ef4a23] focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                required
              />
            </div>

            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ef4a23] transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-11 bg-[#f8f9fa] border border-[#eee] pl-12 pr-4 text-[#111] text-sm focus:outline-none focus:border-[#ef4a23] focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                required
              />
            </div>

            <div className="relative group">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ef4a23] transition-colors" />
              <input
                type="tel"
                placeholder="Phone (Optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-11 bg-[#f8f9fa] border border-[#eee] pl-12 pr-4 text-[#111] text-sm focus:outline-none focus:border-[#ef4a23] focus:bg-white transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ef4a23] transition-colors" />
              <input
                type="password"
                placeholder="Create Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-11 bg-[#f8f9fa] border border-[#eee] pl-12 pr-4 text-[#111] text-sm focus:outline-none focus:border-[#ef4a23] focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-[#ef4a23] text-white font-black uppercase tracking-[0.2em] hover:bg-[#081621] transition-all group flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Recruit
                  <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="pt-6 border-t border-[#eee] flex flex-col items-center gap-4">
              <Link href="/login" className="text-xs uppercase font-bold text-slate-400 hover:text-[#ef4a23] transition-colors tracking-widest flex items-center gap-2">
                <FiArrowLeft size={14} /> Already a pro? <span className="text-[#ef4a23] underline underline-offset-4">Login</span>
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
            <Link href="/" className="text-[10px] uppercase font-bold text-slate-400 hover:text-[#081621] transition-colors tracking-widest">
                Back to Site
            </Link>
        </div>
      </div>

      {/* Decorative slant */}
      <div className="absolute bottom-0 left-0 w-1/4 h-[3px] bg-[#ef4a23] -skew-x-[45deg] translate-y-2" />
      <div className="absolute top-0 right-0 w-1/4 h-[3px] bg-[#ef4a23] -skew-x-[45deg] -translate-y-2" />
    </div>
  );
}


