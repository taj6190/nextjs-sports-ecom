import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/product/ProductCard";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import TodaysDeal from "@/models/TodaysDeal";
import "@/models/Category";
import Link from "next/link";
import { cacheOrQuery } from "@/lib/redis";

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default async function HomePage() {
  await dbConnect();

  const now = new Date();
  const [featuredProducts, deals] = await Promise.all([
    cacheOrQuery<any[]>("home:featuredProducts", async () => {
      const docs = await Product.find({ isActive: true, isFeatured: true, deletedAt: null })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
      return JSON.parse(JSON.stringify(docs));
    }, 300),
    cacheOrQuery<any[]>("home:deals", async () => {
      const docs = await TodaysDeal.find({
        isActive: true,
        startTime: { $lte: now },
        endTime:   { $gte: now },
      })
        .populate({
          path: "product",
          select: "name slug images basePrice brand",
          populate: { path: "category", select: "name" },
        })
        .sort({ endTime: 1 })
        .limit(4)
        .lean();
      return JSON.parse(JSON.stringify(docs));
    }, 300),
  ]);

  let latestProducts: typeof featuredProducts = [];
  if (featuredProducts.length < 8) {
    latestProducts = await cacheOrQuery<any[]>("home:latestProducts", async () => {
      const docs = await Product.find({ isActive: true, deletedAt: null })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
      return JSON.parse(JSON.stringify(docs));
    }, 300);
  }

  // Combine to ensure we have enough products for the scroll section, but deduplicate
  const combined = [...featuredProducts, ...latestProducts].reduce((acc, current) => {
    const x = acc.find((item: any) => item._id === current._id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  const displayProducts = combined.slice(0, 8);

  return (
    <div className="min-h-screen bg-white font-sans text-[#111111]">
      <Header />

      <main className="pb-20">
        {/* HERO SECTION */}
        <section className="relative w-full h-[80vh] bg-slate-900 overflow-hidden flex flex-col justify-end">
          {/* Edge to Edge Image */}
          <img 
            src="https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          <div className="relative z-10 p-6 md:p-12 max-w-[1400px] w-full mx-auto">
            <h1 className="text-white text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
              Defy <br /> The Odds.
            </h1>
            <p className="text-white md:text-xl font-medium mb-8 max-w-lg leading-relaxed">
              Premium performance gear engineered for champions. Shop the latest drops in Cricket, Football, and Badminton.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="bg-white text-black px-8 py-3.5 rounded-full font-bold hover:bg-slate-200 transition-colors">
                Shop All Gear
              </Link>
            </div>
          </div>
        </section>

        {/* ESSENTIALS TILE GRID */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 md:py-24">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8">The Sports Edit</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            {/* Tile 1 - Cricket */}
            <Link href="/shop?search=cricket" className="relative group overflow-hidden bg-slate-100 flex h-[400px] md:h-full">
              <img 
                src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop" 
                alt="Cricket Gear" 
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
              <div className="absolute bottom-8 left-8">
                <span className="bg-white text-black px-6 py-2 rounded-full font-bold uppercase text-[13px] tracking-wider">Cricket</span>
              </div>
            </Link>

            {/* Tile 2 - Football */}
            <Link href="/shop?search=football" className="relative group overflow-hidden bg-slate-100 flex h-[400px] md:h-full">
              <img 
                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200&auto=format&fit=crop" 
                alt="Football Gear" 
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
              <div className="absolute bottom-8 left-8">
                <span className="bg-white text-black px-6 py-2 rounded-full font-bold uppercase text-[13px] tracking-wider">Football</span>
              </div>
            </Link>

            {/* Tile 3 - Badminton */}
            <Link href="/shop?search=badminton" className="relative group overflow-hidden bg-slate-100 flex h-[400px] md:h-full">
              <img 
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop" 
                alt="Badminton Gear" 
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
              <div className="absolute bottom-8 left-8">
                <span className="bg-white text-black px-6 py-2 rounded-full font-bold uppercase text-[13px] tracking-wider">Badminton</span>
              </div>
            </Link>
          </div>
        </section>

        {/* TRENDING GEAR (From DB) */}
        {displayProducts.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Trending Now</h2>
              <Link href="/shop" className="text-[15px] font-bold pb-1 hover:opacity-70 transition-opacity">
                Shop All
              </Link>
            </div>
            
            {/* CSS Scroll Snap Carousel for modern look */}
            <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
              {displayProducts.map((product: any) => (
                <div key={String(product._id)} className="w-[85vw] sm:w-[300px] lg:w-[320px] shrink-0 snap-start">
                  <ProductCard product={JSON.parse(JSON.stringify(product))} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LIFESTYLE BANNER */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
          <div className="relative w-full h-[60vh] bg-slate-200 overflow-hidden flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2400&auto=format&fit=crop" 
              alt="Lifestyle Banner" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 text-center px-4 max-w-2xl">
              <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Focus On The Finish</h2>
              <p className="text-white text-lg font-medium mb-8">Elevate your game with state-of-the-art equipment designed for maximum impact and endurance.</p>
              <Link href="/shop" className="inline-block bg-white text-black px-8 py-3.5 rounded-full font-bold hover:bg-slate-200 transition-colors">
                Explore Gear
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
