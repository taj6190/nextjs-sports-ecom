import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import dbConnect from "@/lib/db";
import TodaysDeal from "@/models/TodaysDeal";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { HiOutlineFire } from "react-icons/hi2";
import { FiArrowRight, FiZap } from "react-icons/fi";
import CountdownTimer from "@/components/product/CountdownTimer";

export const metadata = {
  title: "Today's Deals — ElectroMart",
  description: "Don't miss out on amazing limited-time deals on premium electronics.",
};

export default async function DealsPage() {
  await dbConnect();
  const now = new Date();

  const deals = await TodaysDeal.find({
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gte: now },
  })
    .populate({
      path: "product",
      select: "name slug images basePrice totalStock category brand",
      populate: { path: "category", select: "name slug" },
    })
    .sort({ endTime: 1 })
    .lean();

  const serializedDeals = JSON.parse(JSON.stringify(deals));

  return (
    <div className="min-h-screen bg-[#F2F4F8]">
      <Header />

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm text-orange-400 mb-4">
            <HiOutlineFire size={16} />
            Limited Time Offers
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
            Today&apos;s <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Hot Deals</span>
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Grab these incredible deals before they expire. New deals appear every day!
          </p>
        </div>
      </section>

      {/* Deals Grid */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
        {serializedDeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serializedDeals.map((deal: { _id: string; product: { _id: string; slug: string; name: string; images: { url: string }[]; brand: string; totalStock: number }; dealPrice: number; originalPrice: number; endTime: string }) => {
              const discount = getDiscountPercentage(deal.dealPrice, deal.originalPrice);
              const mainImage = deal.product?.images?.[0]?.url;

              return (
                <div key={deal._id} className="group bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all duration-300">
                  {/* Deal Badge */}
                  <div className="relative">
                    <div className="absolute top-3 left-3 z-10 flex gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-slate-900 text-xs font-bold rounded-lg shadow-lg">
                        -{discount}% OFF
                      </span>
                    </div>

                    <div className="aspect-square bg-slate-100 overflow-hidden">
                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt={deal.product.name}
                          width={400}
                          height={400}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <FiZap size={40} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {deal.product.brand && (
                      <p className="text-xs text-blue-400 font-medium">{deal.product.brand}</p>
                    )}
                    <Link href={`/product/${deal.product.slug}`}>
                      <h3 className="text-base font-semibold text-slate-900 line-clamp-2 hover:text-orange-400 transition-colors">
                        {deal.product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">{formatPrice(deal.dealPrice)}</span>
                      <span className="text-sm text-slate-600 line-through">{formatPrice(deal.originalPrice)}</span>
                      <span className="text-xs text-emerald-400 font-medium">
                        Save {formatPrice(deal.originalPrice - deal.dealPrice)}
                      </span>
                    </div>

                    {/* Countdown */}
                    <CountdownTimer endTime={deal.endTime} />

                    {/* Stock info */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {deal.product.totalStock > 0
                          ? `${deal.product.totalStock} left in stock`
                          : "Out of stock"}
                      </span>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/product/${deal.product.slug}`}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-slate-900 font-medium rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                      <FiZap size={16} /> Grab This Deal <FiArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-slate-50 border-slate-200 rounded-2xl flex items-center justify-center mb-4">
              <HiOutlineFire className="text-slate-600" size={32} />
            </div>
            <p className="text-slate-600 font-medium">No active deals right now</p>
            <p className="text-sm text-slate-600 mt-1">Check back soon for amazing offers!</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-slate-900 font-medium rounded-xl transition-all"
            >
              Browse Products <FiArrowRight size={14} />
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
