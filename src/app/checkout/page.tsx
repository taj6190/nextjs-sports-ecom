"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Input from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiLock, FiShield, FiShoppingBag, FiTruck } from "react-icons/fi";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Pre-fill from session
  useEffect(() => {
    if (session?.user) {
      setShipping(s => ({
        ...s,
        fullName: s.fullName || session.user?.name || "",
        email: s.email || session.user?.email || ""
      }));
    }
  }, [session]);

  const subtotal = totalPrice();
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingCost = subtotal >= 5000 ? 0 : 120;
  const total = subtotal - discount + shippingCost;

  const validate = () => {
    if (!shipping.fullName.trim()) { toast.error("Full name is required"); return false; }
    if (!shipping.phone.trim()) { toast.error("Phone number is required"); return false; }
    if (!/^01[3-9]\d{8}$/.test(shipping.phone.replace(/\s/g, ""))) { toast.error("Enter a valid BD phone number"); return false; }
    if (!shipping.address.trim()) { toast.error("Delivery address is required"); return false; }
    return true;
  };

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) { toast.error("Enter a promo code"); return; }
    setIsApplying(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCodeInput,
          cartItems: items.map(item => ({
            productId: item.productId,
            price: item.variant.price,
            quantity: item.quantity
          }))
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAppliedCoupon(json.data);
        toast.success(`Coupon applied!`);
        setCouponCodeInput("");
      } else {
        toast.error(json.error || "Invalid coupon");
      }
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setIsApplying(false);
    }
  };

  const handleOrder = async () => {
    if (items.length === 0) { toast.error("Cart is empty"); return; }
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            sku: item.variant.sku,
            quantity: item.quantity,
          })),
          shippingAddress: {
            ...shipping,
            city: "General", // Default since field removed
            postalCode: "0000" // Default since field removed
          },
          paymentMethod: "cod",
          couponCode: appliedCoupon?.code,
        }),
      });

      const json = await res.json();
      if (json.success) {
        clearCart();
        toast.success("Order secured successfully!");
        if (session) {
          router.push("/account/orders");
        } else {
          router.push(`/checkout/success?orderNumber=${json.data.orderNumber}`);
        }
      } else {
        toast.error(json.error || "Order failed");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-xl mx-auto px-6 py-32 text-center space-y-6">
          <FiShoppingBag className="mx-auto text-slate-100" size={100} />
          <h1 className="text-2xl font-black uppercase tracking-tight italic">Your Bag is Empty</h1>
          <Link href="/shop" className="block w-full py-4 bg-[#111] text-white font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
            Browse Gear
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Side: Information */}
          <div className="lg:col-span-7 space-y-10">
            <header className="space-y-2">
              <h1 className="text-4xl font-black italic tracking-tighter text-[#111] uppercase">Secure Checkout</h1>
              <p className="text-slate-500 font-medium">Finalize your order by providing delivery details below.</p>
            </header>

            <section className="bg-white border border-slate-200 p-8 shadow-sm">
              <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#ef4a23] mb-8 flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#ef4a23]" /> 01 Delivery Information
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name *"
                    placeholder="John Doe"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    className="border-slate-200 focus:border-black rounded-none"
                    id="checkout-name"
                  />
                  <Input
                    label="Phone Number *"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    className="border-slate-200 focus:border-black rounded-none"
                    id="checkout-phone"
                  />
                </div>

                <Input
                  label="Email Address (Optional)"
                  type="email"
                  placeholder="name@email.com"
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  className="border-slate-200 focus:border-black rounded-none"
                  id="checkout-email"
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Delivery Address *</label>
                  <textarea
                    placeholder="House/Appartment, Road, Area, City"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    className="w-full px-4 py-4 bg-white border border-slate-200 focus:border-black focus:outline-none min-h-[120px] transition-all resize-none font-medium"
                    id="checkout-address"
                  />
                  <p className="text-[10px] text-slate-400 font-medium italic">Please include your city and specific landmarks for faster delivery.</p>
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-200 p-8 shadow-sm">
              <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#ef4a23] mb-6 flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#ef4a23]" /> 02 Payment Selection
              </h2>
              <div className="p-5 border-2 border-[#111] bg-slate-50 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 border-4 border-[#111] rounded-full" />
                  <div>
                    <p className="font-black text-[#111] uppercase text-sm tracking-tight italic">Cash on Delivery (COD)</p>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Pay securely when your package arrives.</p>
                  </div>
                </div>
                <FiTruck className="text-[#111]" size={24} />
              </div>
              <p className="mt-4 text-[11px] text-slate-400 font-medium text-center">Digital payment methods are coming soon.</p>
            </section>
          </div>

          {/* Right Side: Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 border-b border-slate-100 pb-4 text-[#111]">Order Summary</h3>

              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar mb-8">
                {items.map((item) => (
                  <div key={item.variant.sku} className="flex gap-4 group">
                    <div className="w-16 h-20 bg-slate-50 shrink-0 overflow-hidden relative border border-slate-100">
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black uppercase tracking-tight italic line-clamp-1 text-[#111]">{item.productName}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                        {Object.values(item.variant.combination).join(" / ")} • Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-black mt-2 text-[#111]">{formatPrice(item.variant.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Section */}
              <div className="border-t border-slate-100 pt-6 mb-8">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-all uppercase font-bold tracking-widest text-[#111] placeholder:text-slate-300"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplying}
                      className="px-6 bg-[#111] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#ef4a23] transition-all"
                    >
                      {isApplying ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100">
                    <span className="text-[11px] font-black italic tracking-widest uppercase text-emerald-600">Coupon "{appliedCoupon.code}" Active</span>
                    <button onClick={() => setAppliedCoupon(null)} className="text-[10px] font-bold underline text-emerald-600/50 hover:text-emerald-600">Remove</button>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-emerald-500">
                    <span>Discount</span>
                    <span className="font-bold">- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-slate-400">
                  <span>Shipping</span>
                  <span className="text-slate-900 font-bold">{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <span className="text-xl font-black italic tracking-tighter uppercase text-[#111]">Total Amount</span>
                  <span className="text-3xl font-black text-[#111]">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={loading}
                className="w-full mt-10 h-16 bg-[#111] hover:bg-[#ef4a23] text-white font-black uppercase tracking-[0.3em] italic transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-3"
              >
                {loading ? "Securing Order..." : (
                  <>
                    Complete Order <FiShield size={20} />
                  </>
                )}
              </button>

              <div className="mt-8 flex flex-wrap justify-center gap-6 opacity-40">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><FiTruck /> Fast Shipping</div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><FiLock /> Safe Payment</div>
              </div>
            </div>

            <Link href="/shop" className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[#111] transition-colors">
              <FiArrowLeft /> Back to Shop
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
