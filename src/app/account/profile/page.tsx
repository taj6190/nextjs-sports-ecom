"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || ""
      }));
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated");
        await update();
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
         <div className="w-10 h-10 border-2 border-[#eee] border-t-[#111] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <Header />
      <main className="max-w-[700px] mx-auto px-6 py-10 md:py-20">
        
        <Link href="/account" className="inline-flex items-center gap-2 mb-8 text-[13px] font-medium text-[#666] hover:text-[#111] transition-colors">
          <FiArrowLeft /> Back to Account
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-12">
           
           {/* Basic Info */}
           <div className="space-y-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#999] border-b border-[#eee] pb-3">Personal Information</h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-[#eee] focus:border-[#111] outline-none transition-all text-[15px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase text-[#999]">Email Address</label>
                  <input 
                    type="email" 
                    disabled
                    value={formData.email}
                    className="w-full px-4 py-3 border border-[#eee] bg-[#fdfdfd] text-[#999] cursor-not-allowed outline-none text-[15px]"
                  />
                  <p className="text-[10px] text-[#999] italic">Email cannot be changed.</p>
                </div>
              </div>
           </div>

           {/* Security */}
           <div className="space-y-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#999] border-b border-[#eee] pb-3">Security & Password</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter current password to save changes"
                    value={formData.currentPassword}
                    onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-[#eee] focus:border-[#111] outline-none transition-all text-[15px] placeholder:text-[13px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase">New Password</label>
                    <input 
                      type="password" 
                      value={formData.newPassword}
                      onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-[#eee] focus:border-[#111] outline-none transition-all text-[15px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-[#eee] focus:border-[#111] outline-none transition-all text-[15px]"
                    />
                  </div>
                </div>
              </div>
           </div>

           <button 
             type="submit"
             disabled={isLoading}
             className="w-full bg-[#111] text-white py-4 font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 text-[13px] flex items-center justify-center gap-2"
           >
             {isLoading ? "Saving..." : <><FiSave /> Save Changes</>}
           </button>

        </form>

      </main>
      <Footer />
    </div>
  );
}
