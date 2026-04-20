"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { FiPackage, FiClock, FiMapPin, FiChevronDown } from "react-icons/fi";
import type { IOrder } from "@/types";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders?limit=50")
      .then(r => r.json())
      .then(json => { if (json.success) setOrders(json.data); setLoading(false); });
  }, []);

  const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    pending: "warning", confirmed: "info", processing: "info",
    shipped: "info", delivered: "success", cancelled: "danger",
  };

  const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

  const getStepIndex = (status: string) => statusSteps.indexOf(status);

  return (
    <div className="min-h-screen bg-[#F2F4F8]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <FiPackage className="text-blue-400" /> My Orders
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-600 font-medium">No orders yet</p>
            <Link href="/shop" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-slate-900 font-medium rounded-xl transition-all">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order._id;
              const currentStep = getStepIndex(order.orderStatus);

              return (
                <div key={order._id} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    className="w-full p-5 flex items-center justify-between cursor-pointer hover:bg-slate-100/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{order.orderNumber}</p>
                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={statusColors[order.orderStatus]}>{order.orderStatus}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-900 font-bold">{formatPrice(order.total)}</span>
                      <FiChevronDown className={`text-slate-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 p-5 space-y-6 animate-fade-in">
                      {/* Progress Tracker */}
                      {order.orderStatus !== "cancelled" && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 mb-4">Order Progress</h3>
                          <div className="flex items-center justify-between relative">
                            <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-700" />
                            <div className="absolute top-3 left-0 h-0.5 bg-blue-500 transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
                            {statusSteps.map((step, i) => (
                              <div key={step} className="relative flex flex-col items-center z-10">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  i <= currentStep
                                    ? "bg-blue-500 text-white"
                                    : "bg-slate-700 text-slate-500"
                                }`}>
                                  {i < currentStep ? "✓" : i + 1}
                                </div>
                                <span className={`text-[10px] mt-1 capitalize ${i <= currentStep ? "text-blue-400" : "text-slate-600"}`}>
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.orderStatus === "cancelled" && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                          This order has been cancelled.
                        </div>
                      )}

                      {/* Tracking Timeline */}
                      {order.trackingHistory && order.trackingHistory.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <FiClock size={14} /> Tracking Updates
                          </h3>
                          <div className="space-y-0 pl-2">
                            {[...order.trackingHistory].reverse().map((event, i) => (
                              <div key={i} className="flex gap-3 pb-3 last:pb-0">
                                <div className="flex flex-col items-center">
                                  <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-blue-500" : "bg-slate-600"}`} />
                                  {i < order.trackingHistory.length - 1 && <div className="w-0.5 flex-1 bg-slate-700 mt-1" />}
                                </div>
                                <div className="flex-1 -mt-0.5">
                                  <p className="text-xs text-slate-900 capitalize font-medium">{event.status}</p>
                                  <p className="text-[11px] text-slate-600">{event.message}</p>
                                  <p className="text-[10px] text-slate-600 mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">Items</h3>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
                              <div>
                                <Link href={`/product/${item.productSlug || "#"}`} className="text-sm text-slate-900 hover:text-blue-400 font-medium transition-colors">
                                  {item.productName}
                                </Link>
                                <p className="text-xs text-slate-500">
                                  {Object.values(item.variant.combination).join(", ")} × {item.quantity}
                                </p>
                              </div>
                              <span className="text-sm text-slate-900 font-medium">{formatPrice(item.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <FiMapPin size={14} /> Delivery Address
                        </h3>
                        <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-600">
                          <p className="font-medium text-slate-700">{order.shippingAddress.fullName}</p>
                          <p>{order.shippingAddress.phone}</p>
                          <p>{order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}</p>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="p-3 bg-slate-100 rounded-xl text-sm space-y-1">
                        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                        <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span></div>
                        <div className="flex justify-between text-slate-900 font-bold border-t border-slate-300 pt-1"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
