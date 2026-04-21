"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FiCheckCircle, FiPackage, FiMail, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white shadow-xl border border-slate-200 rounded-3xl overflow-hidden animate-fade-in">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <FiCheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-blue-100">Thank you for shopping with Electromart.</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Order Number</p>
            <p className="text-3xl font-mono font-bold text-slate-900">#{orderNumber}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiMail className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Email Confirmation</h3>
                <p className="text-xs text-slate-500 mt-1">We've sent a detailed receipt to your email address.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiPackage className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Fast Shipping</h3>
                <p className="text-xs text-slate-500 mt-1">Our team is already preparing your package for dispatch.</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              Want to track your order easily?
            </h3>
            <p className="text-sm text-indigo-700 mb-4">
              Create an account with the email you used for this order to see real-time updates and your order history.
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-800 group"
            >
              Create an account <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <Link 
              href="/shop" 
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-semibold"
            >
              <FiShoppingBag /> Continue Shopping
            </Link>
            <Link 
              href="/" 
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-semibold"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8]">
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
