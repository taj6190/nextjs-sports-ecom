"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiUserPlus } from "react-icons/fi";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("PERSONNEL PROTOCOL INITIALIZED");
        router.push("/admin/users");
      } else {
        toast.error(data.message?.toUpperCase() || "INITIALIZATION FAILED");
      }
    } catch {
      toast.error("NETWORK ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl select-none">
      <div>
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase italic text-white/40 hover:text-white transition-colors mb-6 border border-white/10 px-3 py-1.5 hover:bg-white/5">
          <FiArrowLeft size={12} /> Abort Profile Creation
        </Link>
        <div className="flex items-center gap-2 mb-2">
           <div className="w-1.5 h-4 bg-[#ef4a23]" />
           <h2 className="text-[10px] font-black tracking-[0.4em] text-[#ef4a23] uppercase italic">Operative Entry</h2>
        </div>
        <h1 className="text-3xl lg:text-4xl font-[1000] text-white tracking-tighter uppercase italic">
          Enlist <span className="text-white/20">Personnel</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111119] border border-white/[0.06] p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Ident (Name)</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-white text-[12px] font-bold tracking-widest uppercase italic outline-none focus:border-[#ef4a23] transition-colors placeholder:text-white/20"
              placeholder="J. DOE"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Comm Link (Email)</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-white text-[12px] font-bold tracking-widest uppercase italic outline-none focus:border-[#ef4a23] transition-colors placeholder:text-white/20"
              placeholder="OPERATIVE@NETWORK.COM"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Access Codes (Password)</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-white text-[12px] font-bold tracking-widest uppercase italic outline-none focus:border-[#ef4a23] transition-colors placeholder:text-white/20"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Freq. Channel (Phone)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] text-white text-[12px] font-bold tracking-widest uppercase italic outline-none focus:border-[#ef4a23] transition-colors placeholder:text-white/20"
              placeholder="+8801XXXXXXXXX"
            />
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-white/[0.06]">
          <label className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Clearance Level</label>
          <div className="flex gap-4">
            {["user", "admin"].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`flex-1 py-3 text-[11px] font-black tracking-widest uppercase italic border transition-all ${
                  form.role === role
                    ? "bg-[#ef4a23] border-[#ef4a23] text-white"
                    : "bg-white/[0.02] border-white/20 text-white/40 hover:border-white/50 hover:text-white"
                }`}
              >
                {role === "admin" ? "Level 5 (Admin)" : "Level 1 (User)"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-6 bg-white hover:bg-white/90 text-black text-[12px] font-black tracking-[0.2em] uppercase italic transition-all disabled:opacity-50 flex items-center justify-center gap-3 border border-transparent"
        >
          <FiUserPlus size={16} />
          {loading ? "INITIALIZING SECURE PROFILE..." : "INITIALIZE PROFILE"}
        </button>
      </form>
    </div>
  );
}
