"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiChevronRight } from "react-icons/fi";

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
      setError("Invalid credentials. Try again.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 text-center">
        <Link href="/" className="inline-block mb-8">
            <span className="text-4xl font-black text-[#081621] italic tracking-tighter hover:text-[#ef4a23] transition-colors uppercase">
                VELOCITY
            </span>
        </Link>
        <h1 className="text-2xl font-bold text-[#081621] uppercase tracking-wider mb-2">Login to Gear Up</h1>
        <div className="h-1 w-12 bg-[#ef4a23] mx-auto" />
      </div>

      <div className="bg-white border border-[#eee] shadow-[0_15px_40px_rgba(0,0,0,0.05)] p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 text-xs font-bold text-red-600 uppercase tracking-tight animate-in slide-in-from-left duration-300">
                {error}
            </div>
            )}

            <div className="space-y-4">
            <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ef4a23] transition-colors" />
                <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-12 bg-[#f8f9fa] border border-[#eee] pl-12 pr-4 text-[#111] text-sm focus:outline-none focus:border-[#ef4a23] focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                required
                />
            </div>

            <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ef4a23] transition-colors" />
                <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-12 bg-[#f8f9fa] border border-[#eee] pl-12 pr-4 text-[#111] text-sm focus:outline-none focus:border-[#ef4a23] focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                required
                />
            </div>
            </div>

            <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#ef4a23] text-white font-black uppercase tracking-[0.2em] hover:bg-[#081621] transition-all group flex items-center justify-center gap-2"
            >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                Access Account
                <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                </>
            )}
            </button>

            <div className="pt-6 border-t border-[#eee] flex flex-col items-center gap-4">
                <Link href="/register" className="text-xs uppercase font-bold text-slate-400 hover:text-[#ef4a23] transition-colors tracking-widest">
                    New Player? <span className="text-[#ef4a23] ml-1 underline underline-offset-4">Create Account</span>
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
  );
}

export default function LoginPage() {
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

      <div className="relative z-10 w-full flex items-center justify-center p-6 lg:p-12 scale-in">
        <Suspense fallback={<div className="text-[#081621] font-bold tracking-widest animate-pulse uppercase">Syncing...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Decorative slant */}
      <div className="absolute bottom-0 right-0 w-1/4 h-[3px] bg-[#ef4a23] skew-x-[45deg] translate-y-2" />
      <div className="absolute top-0 left-0 w-1/4 h-[3px] bg-[#ef4a23] skew-x-[45deg] -translate-y-2" />
    </div>
  );
}


