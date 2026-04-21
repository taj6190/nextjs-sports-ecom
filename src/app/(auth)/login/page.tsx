"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { FiChevronRight, FiLock, FiMail, FiArrowLeft } from "react-icons/fi";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Authorization failed. Ensure credentials match records.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-sm relative z-10">
      <div className="mb-12 text-center">
        <Link href="/" className="inline-block mb-10 group">
            <span className="text-4xl md:text-5xl font-[1000] text-[#081621] italic tracking-tighter group-hover:text-[#ef4a23] transition-all uppercase">
                VELOCITY
            </span>
        </Link>
        <div className="flex items-center justify-center gap-3 mb-3">
           <span className="w-1.5 h-1.5 bg-[#ef4a23]" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#081621]/40 italic">Personnel // Authentication</p>
        </div>
        <h1 className="text-2xl font-[1000] text-[#081621] uppercase italic tracking-tight">Access Control</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-[#ef4a23] p-4 text-[11px] font-bold text-[#ef4a23] uppercase italic tracking-widest animate-in slide-in-from-top-1 duration-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center border-r border-[#eee]">
               <FiMail className="text-[#081621] opacity-30 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              type="email"
              placeholder="IDENT//EMAIL ADDRESS"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-14 bg-white border border-[#eee] focus:border-[#081621] pl-16 pr-6 text-[#081621] text-sm font-bold uppercase outline-none transition-all placeholder:text-[#ccc] placeholder:text-[10px] placeholder:tracking-[0.2em]"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center border-r border-[#eee]">
               <FiLock className="text-[#081621] opacity-30 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <input
              type="password"
              placeholder="SECURE//PASSWORD"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full h-14 bg-white border border-[#eee] focus:border-[#081621] pl-16 pr-6 text-[#081621] text-sm font-bold outline-none transition-all placeholder:text-[#ccc] placeholder:text-[10px] placeholder:tracking-[0.2em] placeholder:font-black"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-[#081621] hover:bg-[#ef4a23] text-white font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 italic text-[12px] group cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Initialize Access
              <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="pt-10 flex flex-col items-center gap-6">
            <Link href="/register" className="text-[11px] uppercase font-black text-[#081621]/40 hover:text-[#ef4a23] transition-all tracking-[0.2em] italic">
                New Unit? <span className="text-[#081621] ml-1 border-b border-[#081621]/20">Create Deployment ID</span>
            </Link>
            <Link href="/" className="flex items-center gap-2 text-[10px] uppercase font-black text-[#081621]/20 hover:text-[#081621] transition-all tracking-[0.3em] italic">
                <FiArrowLeft /> Exit to Core Site
            </Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden select-none">
      
      {/* Pristine Minimalist Backdrop */}
      <div
        className="absolute inset-0 opacity-[0.06] grayscale pointer-events-none"
        style={{
            backgroundImage: `url('/sports_light_auth_bg_1776753484363.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
      />
      
      {/* Technical Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#081621 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full flex items-center justify-center p-6 lg:p-12 animate-in fade-in zoom-in-95 duration-700">
        <Suspense fallback={<div className="text-[10px] font-black tracking-[0.5em] text-[#081621]/20 animate-pulse uppercase">Syncing Ident...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Industrial Accents */}
      <div className="absolute bottom-0 right-0 w-1/4 h-1 bg-[#ef4a23]" />
      <div className="absolute top-0 left-0 w-1/4 h-1 bg-[#081621]" />
    </div>
  );
}
