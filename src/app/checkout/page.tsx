"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { FiCheck, FiTruck, FiShield, FiArrowLeft, FiShoppingBag, FiCreditCard, FiMapPin, FiGift } from "react-icons/fi";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: shipping, 2: review
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ 
    code: string; 
    discountType: string;
    discountAmount: number;
  } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Pre-fill from user data
  useEffect(() => {
    if (session?.user?.name) {
      setShipping(s => ({ ...s, fullName: s.fullName || session.user.name || "" }));
    }
  }, [session]);

  const subtotal = totalPrice();
  // Rely exclusively on API supplied subtotal maths:
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingCost = subtotal >= 5000 ? 0 : 120;
  const total = subtotal - discount + shippingCost;

  const validateShipping = () => {
    if (!shipping.fullName.trim()) { toast.error("Full name is required"); return false; }
    if (!shipping.phone.trim()) { toast.error("Phone number is required"); return false; }
    if (!/^01[3-9]\d{8}$/.test(shipping.phone.replace(/\s/g, ""))) { toast.error("Enter a valid Bangladesh phone number (01XXXXXXXXX)"); return false; }
    if (!shipping.address.trim()) { toast.error("Address is required"); return false; }
    if (!shipping.city.trim()) { toast.error("City is required"); return false; }
    if (!shipping.postalCode.trim()) { toast.error("Postal code is required"); return false; }
    return true;
  };

  const handleProceedToReview = () => {
    if (validateShipping()) setStep(2);
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

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  const handleOrder = async () => {
    if (items.length === 0) { toast.error("Your cart is empty"); return; }
    if (!validateShipping()) return;

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
          shippingAddress: shipping,
          paymentMethod: "cod",
          couponCode: appliedCoupon?.code,
        }),
      });

      const json = await res.json();
      if (json.success) {
        clearCart();
        toast.success("Order placed successfully! 🎉");
        router.push("/account/orders");
      } else {
        toast.error(json.error || "Failed to place order");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F2F4F8]">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto bg-slate-50 border-slate-200 rounded-2xl flex items-center justify-center mb-4">
            <FiShoppingBag className="text-slate-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
          <p className="text-slate-600 mb-6">Add some products to continue to checkout.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-slate-900 rounded-xl transition-all">
            Browse Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F8]">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Checkout Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: "Shipping" },
            { num: 2, label: "Review & Pay" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s.num ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {step > s.num ? <FiCheck /> : s.num}
              </div>
              <span className={`text-sm font-medium ${step >= s.num ? "text-slate-900" : "text-slate-500"}`}>
                {s.label}
              </span>
              {s.num < 2 && <div className={`w-16 h-0.5 ${step > s.num ? "bg-blue-500" : "bg-slate-100"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FiMapPin className="text-blue-400" /> Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name *" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} required id="shipping-name" placeholder="Enter your full name" />
                  <Input label="Phone Number *" type="tel" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} required id="shipping-phone" placeholder="01XXXXXXXXX" />
                </div>
                <Input label="Full Address *" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} placeholder="House/Flat, Road, Area, Landmark" required id="shipping-address" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">City *</label>
                    <select value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
                      <option value="">Select City</option>
                      {["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Rangpur", "Barishal", "Mymensingh", "Comilla", "Gazipur", "Narayanganj"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Postal Code *" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} required id="shipping-postal" placeholder="1205" />
                </div>
                <div className="pt-2">
                  <Button onClick={handleProceedToReview} size="lg" className="w-full">
                    Continue to Review
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                {/* Review Shipping */}
                <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <FiMapPin className="text-blue-400" /> Delivery To
                    </h2>
                    <button onClick={() => setStep(1)} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">Edit</button>
                  </div>
                  <div className="p-4 bg-slate-100 rounded-xl text-sm">
                    <p className="font-medium text-slate-900">{shipping.fullName}</p>
                    <p className="text-slate-600">{shipping.phone}</p>
                    <p className="text-slate-600">{shipping.address}</p>
                    <p className="text-slate-600">{shipping.city} - {shipping.postalCode}</p>
                  </div>
                </div>

                {/* Order Items Review */}
                <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 animate-fade-in">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FiShoppingBag className="text-blue-400" /> Order Items ({items.length})
                  </h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.variant.sku} className="flex items-center gap-4 p-3 bg-slate-100 rounded-xl">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {item.productImage ? (
                            <Image src={item.productImage} alt={item.productName} width={64} height={64} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">N/A</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-slate-500">
                            {Object.values(item.variant.combination).join(", ")} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{formatPrice(item.variant.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 animate-fade-in">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FiCreditCard className="text-blue-400" /> Payment Method
                  </h2>
                  <label className="flex items-center gap-3 p-4 border-2 border-blue-500 bg-blue-500/5 rounded-xl cursor-pointer">
                    <input type="radio" checked readOnly className="text-blue-600" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-900">Cash on Delivery (COD)</span>
                      <p className="text-xs text-slate-500">Pay when you receive your order</p>
                    </div>
                    <FiCheck className="text-blue-400" />
                  </label>
                  <div className="flex gap-3 mt-3">
                    <div className="flex-1 p-4 border border-slate-200 rounded-xl opacity-50">
                      <span className="text-sm text-slate-500">bKash</span>
                      <span className="ml-2 text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Coming Soon</span>
                    </div>
                    <div className="flex-1 p-4 border border-slate-200 rounded-xl opacity-50">
                      <span className="text-sm text-slate-500">Nagad</span>
                      <span className="ml-2 text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Coming Soon</span>
                    </div>
                  </div>
                </div>

                {/* Place Order */}
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
                    <FiArrowLeft size={16} /> Back
                  </button>
                  <Button onClick={handleOrder} isLoading={loading} size="lg" className="flex-1">
                    <FiShield className="mr-2" /> Place Order • {formatPrice(total)}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="sticky top-20 bg-white shadow-sm border border-slate-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.variant.sku} className="flex justify-between text-sm">
                    <div>
                      <p className="text-slate-900 line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-slate-500">
                        {Object.values(item.variant.combination).join(", ")} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-slate-900 font-medium">{formatPrice(item.variant.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              {/* Promo Code Section */}
              <div className="pt-4 border-t border-slate-200">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <FiGift />
                      <span className="text-sm font-bold tracking-wider">{appliedCoupon.code}</span>
                      <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-full">
                        {appliedCoupon.discountType === "percentage" ? "Percentage Off" : "Fixed Discount"}
                      </span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-xs text-emerald-600 hover:text-emerald-800 underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-sm"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    />
                    <Button onClick={handleApplyCoupon} isLoading={isApplying} variant="secondary" className="px-6 rounded-xl">
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-500 font-medium">Coupon Discount</span>
                    <span className="text-emerald-500 font-medium">- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className={shippingCost === 0 ? "text-emerald-400" : "text-slate-900"}>
                    {shippingCost === 0 ? "Free ✓" : formatPrice(shippingCost)}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-[11px] text-slate-500">Free shipping on orders over ৳5,000</p>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <FiTruck size={14} className="text-blue-400" />
                  <span>Fast delivery across BD</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <FiShield size={14} className="text-emerald-400" />
                  <span>100% genuine products</span>
                </div>
              </div>

              <Link href="/shop" className="block text-center text-sm text-blue-400 hover:text-blue-300">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
