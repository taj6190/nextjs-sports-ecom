"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiChevronRight, FiLock, FiMail, FiPhone, FiUser } from "react-icons/fi";

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
        toast.success("Deployment ID Created. Please initialize access.");
        router.push("/login");
      } else {
        toast.error(json.error || "Registration cycle failed");
      }
    } catch {
      toast.error("Internal connection error during enlistment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden select-none">
      
      {/* Pristine Minimalist Backdrop */}
      <div
        className="absolute inset-0 opacity-[0.05] grayscale pointer-events-none"
        style={{
            backgroundImage: `url('/sports_light_auth_bg_1776753484363.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
      />
      
      {/* Technical Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#081621 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-12 text-center">
          <Link href="/" className="inline-block mb-10 group">
            <span className="text-4xl md:text-5xl font-[1000] text-[#081621] italic tracking-tighter group-hover:text-[#ef4a23] transition-all uppercase">
              VELOCITY
            </span>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-3">
             <span className="w-1.5 h-1.5 bg-[#ef4a23]" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#081621]/40 italic">Personnel // Recruitment</p>
          </div>
          <h1 className="text-2xl font-[1000] text-[#081621] uppercase italic tracking-tight">Create Identity</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center border-r border-[#eee]">
               <FiUser className="text-[#081621] opacity-30 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              type="text"
              placeholder="FULL PERSONNEL NAME"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-12 bg-white border border-[#eee] focus:border-[#081621] pl-16 pr-6 text-[#081621] text-xs font-bold uppercase outline-none transition-all placeholder:text-[#ccc]"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center border-r border-[#eee]">
               <FiMail className="text-[#081621] opacity-30 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              type="email"
              placeholder="IDENT//EMAIL ADDRESS"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-12 bg-white border border-[#eee] focus:border-[#081621] pl-16 pr-6 text-[#081621] text-xs font-bold uppercase outline-none transition-all placeholder:text-[#ccc]"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center border-r border-[#eee]">
               <FiPhone className="text-[#081621] opacity-30 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              type="tel"
              placeholder="COORD//PHONE (OPTIONAL)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full h-12 bg-white border border-[#eee] focus:border-[#081621] pl-16 pr-6 text-[#081621] text-xs font-bold uppercase outline-none transition-all placeholder:text-[#ccc]"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center border-r border-[#eee]">
               <FiLock className="text-[#081621] opacity-30 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              type="password"
              placeholder="SECURE//CREATE PASSWORD"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full h-12 bg-white border border-[#eee] focus:border-[#081621] pl-16 pr-6 text-[#081621] text-xs font-bold outline-none transition-all placeholder:text-[#ccc]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-6 bg-[#081621] hover:bg-[#ef4a23] text-white font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 italic text-[12px] group cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Confirm Recruitment
                <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="pt-10 border-t border-[#eee] flex flex-col items-center gap-6 text-center">
            <Link href="/login" className="text-[11px] uppercase font-black text-[#081621]/40 hover:text-[#ef4a23] transition-all tracking-[0.2em] italic flex items-center gap-2">
              <FiArrowLeft size={14} /> Already Active User? <span className="text-[#081621] border-b border-[#081621]/20">Login</span>
            </Link>
          </div>
        </form>
      </div>

      {/* Industrial Accents */}
      <div className="absolute bottom-0 left-0 w-1/4 h-1 bg-[#ef4a23]" />
      <div className="absolute top-0 right-0 w-1/4 h-1 bg-[#081621]" />
    </div>
  );
}
