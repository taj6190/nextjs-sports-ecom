"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => { if (d.success) setUsers(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Purge personnel record?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("RECORD EXPUNGED");
      setUsers(u => u.filter(x => x._id !== id));
    } else {
      toast.error(data.message?.toUpperCase() || "PURGE FAILED");
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-[#ef4a23]" />
            <h2 className="text-[10px] font-black tracking-[0.4em] text-[#ef4a23] uppercase italic">Personnel Roster</h2>
           </div>
           <h1 className="text-3xl lg:text-4xl font-[1000] text-white tracking-tighter uppercase italic">
            Active <span className="text-white/20">Operatives</span>
           </h1>
        </div>
        <Link
          href="/admin/users/create"
          className="inline-flex items-center gap-3 px-6 py-3 bg-[#ef4a23] text-white text-[11px] font-black tracking-[0.2em] uppercase italic hover:bg-white hover:text-black transition-colors"
        >
          <FiUserPlus size={16} /> Enlist Personnel
        </Link>
      </div>

      {/* Control Panel */}
      <div className="bg-[#111119] border border-white/[0.06] p-4 flex flex-col md:flex-row gap-4">
        <div className="relative max-w-md w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            placeholder="SCAN IDENTITIES..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] text-[11px] font-bold tracking-[0.2em] text-white placeholder-white/30 uppercase italic focus:outline-none focus:border-[#ef4a23] transition-colors"
          />
        </div>
      </div>

      {/* Data Roster */}
      <div className="bg-[#111119] border border-white/[0.06]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Operative</th>
              <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Comm Link</th>
              <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Clearance</th>
              <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Enlisted</th>
              <th className="py-4 px-5 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-16 text-center text-[10px] font-black tracking-[0.4em] text-white/20 uppercase italic animate-pulse">Scanning Roster...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center text-[10px] font-black tracking-[0.4em] text-white/20 uppercase italic">No Matches Detected</td></tr>
            ) : (
              filtered.map(user => (
                <tr key={user._id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#ef4a23] text-lg font-black italic">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-black text-white text-[12px] uppercase italic tracking-wider">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-[11px] font-bold tracking-[0.1em] text-white/40 uppercase truncate max-w-[200px]">{user.email}</td>
                  <td className="py-4 px-5">
                    <span className={`px-2 py-1 text-[9px] font-black tracking-widest uppercase italic border ${
                      user.role === "admin"
                        ? "text-[#ef4a23] border-[#ef4a23]/30 bg-[#ef4a23]/10"
                        : "text-white/60 border-white/20 bg-white/5"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-[10px] font-bold tracking-widest text-white/30 uppercase italic">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${user._id}/edit`}
                        className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/40 hover:text-white hover:border-[#ef4a23] hover:bg-[#ef4a23] transition-colors"
                      >
                        <FiEdit2 size={12} />
                      </Link>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/40 hover:text-white hover:border-red-500 hover:bg-red-500 transition-colors"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && (
          <div className="px-5 py-3 text-[9px] font-black tracking-widest text-white/20 uppercase italic border-t border-white/[0.06]">
            {filtered.length} of {users.length} Operatives Listed
          </div>
        )}
      </div>
    </div>
  );
}
