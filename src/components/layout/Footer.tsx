"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiFacebook, FiInstagram, FiTwitter, FiMapPin, FiPhone, FiMail } from "react-icons/fi";

export default function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-[#081621] border-t-4 border-[#ef4a23]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Contact */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">
                Electro<span className="text-[#ef4a23]">Mart</span>
              </span>
            </Link>
            <p className="text-[13px] text-slate-400 leading-relaxed max-w-sm">
              Your trusted destination for premium electronics. Best quality, best prices, delivered to your doorstep.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-400 text-[13px]">
                <FiPhone className="text-[#ef4a23]" size={16} />
                <span>+880 1XXX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[13px]">
                <FiMail className="text-[#ef4a23]" size={16} />
                <span>support@electromart.com.bd</span>
              </div>
              <div className="flex items-start gap-3 text-slate-400 text-[13px]">
                <FiMapPin className="text-[#ef4a23]" size={16} />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[15px] font-bold text-white uppercase tracking-widest mb-6">About Us</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-[13px] text-slate-400 hover:text-[#ef4a23] transition-colors">Our Company</Link></li>
              <li><Link href="/" className="text-[13px] text-slate-400 hover:text-[#ef4a23] transition-colors">Contact Us</Link></li>
              <li><Link href="/" className="text-[13px] text-slate-400 hover:text-[#ef4a23] transition-colors">Terms and Conditions</Link></li>
              <li><Link href="/" className="text-[13px] text-slate-400 hover:text-[#ef4a23] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[15px] font-bold text-white uppercase tracking-widest mb-6">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-[13px] text-slate-400 hover:text-[#ef4a23] transition-colors">Refund and Return Policy</Link></li>
              <li><Link href="/" className="text-[13px] text-slate-400 hover:text-[#ef4a23] transition-colors">EMI Policy</Link></li>
              <li><Link href="/" className="text-[13px] text-slate-400 hover:text-[#ef4a23] transition-colors">Delivery Options</Link></li>
              <li><Link href="/track-order" className="text-[13px] text-slate-400 hover:text-[#ef4a23] transition-colors">Track Order</Link></li>
              <li><Link href="/account" className="text-[13px] text-slate-400 hover:text-[#ef4a23] transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[15px] font-bold text-white uppercase tracking-widest mb-6">Stay Connected</h4>
            <p className="text-[13px] text-slate-400 mb-4">
              Subscribe to get notified about new deals and updates.
            </p>
            {mounted ? (
              <div className="flex mb-6">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full px-4 py-2 bg-[#0c1e2b] border border-[#1b3446] text-white text-[13px] focus:outline-none focus:border-[#ef4a23]" 
                />
                <button className="px-4 py-2 bg-[#ef4a23] hover:bg-[#d03d1c] text-white text-[13px] font-bold uppercase tracking-wider transition-colors">
                  Subscribe
                </button>
              </div>
            ) : (
              <div className="flex mb-6 h-[42px] bg-[#0c1e2b] border border-[#1b3446] animate-pulse" />
            )}
            
            <div className="flex gap-2">
              <a href="#" className="w-10 h-10 border border-[#1b3446] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#3b5998] hover:border-[#3b5998] transition-colors">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-[#1b3446] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#c32aa3] hover:border-[#c32aa3] transition-colors">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-[#1b3446] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1da1f2] hover:border-[#1da1f2] transition-colors">
                <FiTwitter size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#1b3446] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-slate-500" suppressHydrationWarning>
            © {new Date().getFullYear()} VELOCITY Gear. | All rights reserved.
          </p>
          <div className="text-[13px] text-slate-500 flex items-center gap-1">
            Developed with <span className="text-[#ef4a23] text-lg">♥</span> for premium tech
          </div>
        </div>
      </div>
    </footer>
  );
}
