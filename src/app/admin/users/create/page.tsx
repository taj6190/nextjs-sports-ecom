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
        toast.success("User created successfully");
        router.push("/admin/users");
      } else {
        toast.error(data.message || "Failed to create user");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <FiArrowLeft size={14} /> Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-white">Create User</h1>
        <p className="text-sm text-slate-500 mt-1">Add a new user to the system</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl outline-none focus:border-blue-500 transition-all"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl outline-none focus:border-blue-500 transition-all"
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl outline-none focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl outline-none focus:border-blue-500 transition-all"
              placeholder="+8801XXXXXXXXX"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
          <div className="flex gap-3">
            {["user", "admin"].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl border transition-all capitalize ${
                  form.role === role
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FiUserPlus size={16} />
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
