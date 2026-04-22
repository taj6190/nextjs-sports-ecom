import OfficialMerch from "@/components/home/OfficialMerch";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/product/ProductCard";
import dbConnect from "@/lib/db";
import { cacheOrQuery } from "@/lib/redis";
import "@/models/Category";
import Product from "@/models/Product";
import Link from "next/link";
import { FiActivity, FiArrowRight, FiAward, FiTarget, FiZap } from "react-icons/fi";

export default async function HomePage() {
  await dbConnect();

  const now = new Date();
  const [featuredProducts, latestProducts] = await Promise.all([
    cacheOrQuery<any[]>("home:featuredProducts", async () => {
      const docs = await Product.find({ isActive: true, isFeatured: true, deletedAt: null })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
      return JSON.parse(JSON.stringify(docs));
    }, 300),
    cacheOrQuery<any[]>("home:latestProducts", async () => {
      const docs = await Product.find({ isActive: true, deletedAt: null })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
      return JSON.parse(JSON.stringify(docs));
    }, 300),
  ]);

  const displayProducts = [...featuredProducts, ...latestProducts]
    .filter((v, i, a) => a.findIndex(t => t._id === v._id) === i)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-white font-sans text-[#081621] select-none">
      <Header />

      <main>
        {/* ── SECTION 01: HERO COMMAND ── */}
        <section className="relative min-h-[70vh] md:min-h-[90vh] bg-white flex items-center overflow-hidden border-b border-[#eee]">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#111_1px,transparent_0)] [background-size:32px_32px]" />

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 w-full pt-4 pb-8 md:pt-10 md:pb-20">
            <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-12 lg:gap-20">

              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-left duration-700">
                  <span className="w-8 h-1 bg-[#ef4a23]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ef4a23] italic">Velocity // Performance Engine</span>
                </div>

                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[110px] font-[1000] text-[#081621] uppercase italic tracking-tighter leading-[0.85] mb-8 animate-in slide-in-from-bottom-4 duration-1000">
                  Beyond <br />
                  <span className="text-[#ef4a23]">Human</span> <br />
                  Limits.
                </h1>

                <p className="max-w-md text-[14px] md:text-lg font-bold text-[#081621]/50 uppercase tracking-tight leading-relaxed mb-10 border-l-4 border-[#081621] pl-6 animate-in fade-in duration-1000 delay-300">
                  Surgical grade sport technology for elite competitors. Engineered to dominate every field of deployment.
                </p>

                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 animate-in fade-in duration-1000 delay-500">
                  <Link href="/shop" className="bg-[#081621] text-white px-10 py-5 text-[12px] font-black uppercase italic tracking-[0.2em] hover:bg-[#ef4a23] transition-all flex items-center justify-center gap-4">
                    Deploy Gear <FiArrowRight />
                  </Link>
                  <Link href="/shop" className="bg-white border-2 border-[#eee] text-[#081621] px-10 py-5 text-[12px] font-black uppercase italic tracking-[0.2em] hover:border-[#081621] transition-all flex items-center justify-center">
                    The Archive
                  </Link>
                </div>
              </div>

              <div className="hidden lg:block lg:col-span-5 relative">
                 <div className="relative z-10 border-[16px] border-white shadow-[40px_40px_0px_rgba(8,22,33,0.04)]">
                    <img
                      src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop"
                      alt="Velocity Gear"
                      className="w-full aspect-[4/5] object-cover"
                    />
                    <div className="absolute -top-4 -right-4 bg-[#ef4a23] text-white p-4 font-black italic text-[10px] uppercase tracking-[0.3em]">
                       Node.2024
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 02: KINETIC CATEGORIES ── */}
        <section className="bg-white py-20 border-b border-[#eee]">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#ef4a23]" />
                    <span className="text-[#ef4a23] font-black italic uppercase tracking-[0.4em] text-[10px]">Ecosystem Segments</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter text-[#081621]">
                     Category <span className="text-[#ef4a23] italic">Matrix</span>
                  </h2>
               </div>
               <Link href="/shop" className="group flex items-center gap-3 text-[11px] font-black uppercase italic tracking-[0.2em] text-[#081621]/40 hover:text-[#081621] transition-all">
                  View Full Array <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>

            <div className="flex overflow-x-auto pb-8 gap-4 md:grid md:grid-cols-3 md:gap-4 no-scrollbar">
              {[
                { name: "Cricket // Pro", img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80", tag: "01" },
                { name: "Football // Elite", img: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80", tag: "02" },
                { name: "Badminton // Tech", img: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80", tag: "03" }
              ].map((cat) => (
                <Link key={cat.tag} href={`/shop?search=${cat.name.split(' ')[0]}`} className="relative group shrink-0 w-[280px] md:w-full aspect-[4/5] overflow-hidden border border-[#eee] hover:border-[#081621] transition-all">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081621] to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-2 text-[#ef4a23]">Segment {cat.tag}</p>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 03: GEAR DROPS (MOBILE 2-COL GRID) ── */}
        <section className="bg-[#fcfcfc] py-20">
          <div className="max-w-[1400px] mx-auto px-4 md:px-12">
            <div className="flex items-center justify-between mb-12 border-b border-[#eee] pb-8">
               <div className="flex items-center gap-4">
                  <FiZap className="text-[#ef4a23]" size={24} />
                  <h2 className="text-3xl md:text-5xl font-[1000] uppercase tracking-tighter">Recent <span className="italic">Drops</span></h2>
               </div>
               <Link href="/shop" className="hidden md:flex items-center gap-3 text-[11px] font-black uppercase italic tracking-[0.2em] hover:text-[#ef4a23] transition-all">
                  Access Inventory <FiArrowRight />
               </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
               {displayProducts.map((product: any) => (
                 <div key={String(product._id)} className="scale-up">
                    <ProductCard product={JSON.parse(JSON.stringify(product))} />
                 </div>
               ))}
            </div>

            <Link href="/shop" className="md:hidden mt-10 w-full py-5 border-2 border-[#eee] flex items-center justify-center text-[11px] font-black uppercase italic tracking-[0.3em] hover:bg-[#081621] hover:text-white transition-all">
               View Full Inventory
            </Link>
          </div>
        </section>

        <OfficialMerch />

        {/* ── SECTION 04: TECHNICAL DEPLOYMENT ── */}
        <section className="bg-white py-20 border-t border-[#eee]">
           <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
              {[
                { icon: FiActivity, title: "Performance Verified", desc: "Elite grade gear subjected to ballistic structural stress tests for competitive output." },
                { icon: FiTarget, title: "Surgical Precision", desc: "Microscopic optimization from aerodynamic profiles to textile tensile strength." },
                { icon: FiAward, title: "Rapid Logistics", desc: "Proprietary supply chain ensuring accelerated transit of performance equipment global-wide." }
              ].map((feat, i) => (
                <div key={i} className="flex flex-col items-start">
                   <div className="w-12 h-12 bg-[#081621] text-white flex items-center justify-center mb-8 rotate-45">
                      <feat.icon size={20} className="-rotate-45" />
                   </div>
                   <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 text-[#081621]">{feat.title}</h3>
                   <p className="text-[12px] font-bold text-[#081621]/40 uppercase tracking-wide leading-relaxed">{feat.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* ── SECTION 05: MANIFESTO ── */}
        <section className="bg-[#081621] py-24 md:py-32 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef4a23] opacity-5 rounded-full blur-3xl" />
           <div className="max-w-[1400px] mx-auto px-6 relative z-10">
              <span className="text-[#ef4a23] font-black uppercase tracking-[0.5em] text-[9px] mb-10 block animate-pulse">// Velocity Core Mission</span>
              <h2 className="text-5xl md:text-8xl font-[1000] uppercase tracking-tighter text-white leading-[0.9] max-w-4xl mx-auto mb-16">
                 Engineered <br />
                 <span className="text-[#ef4a23] italic">For Absolute Win.</span>
              </h2>
              <Link href="/shop" className="inline-block bg-[#ef4a23] text-white px-16 py-6 text-[13px] font-black uppercase italic tracking-[0.3em] hover:bg-white hover:text-[#081621] transition-all">
                 Enter The Vault
              </Link>
           </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
