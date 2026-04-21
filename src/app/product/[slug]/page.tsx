import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductSpecifications from "@/components/product/ProductSpecifications";
import RelatedProducts from "@/components/product/RelatedProducts";
import ReviewSection from "@/components/product/ReviewSection";
import VariantSelector from "@/components/product/VariantSelector";
import WhatsAppButton from "@/components/product/WhatsAppButton";
import dbConnect from "@/lib/db";
import { cacheOrQuery } from "@/lib/redis";
import "@/models/Category";
import Product from "@/models/Product";
import TodaysDeal from "@/models/TodaysDeal";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  await dbConnect();
  const { slug } = await params;
  const product = await cacheOrQuery<any>(`product:meta:${slug}`, async () => {
    return Product.findOne({ slug, isActive: true, deletedAt: null }).lean();
  }, 3600);

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seo?.title || `${product.name} — ElectroMart`,
    description: product.seo?.description || product.description?.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  await dbConnect();
  const { slug } = await params;

  const product = await cacheOrQuery<any>(`product:data:${slug}`, async () => {
    return Product.findOne({ slug, isActive: true, deletedAt: null })
      .populate("category", "name slug icon")
      .lean();
  }, 3600);

  if (!product) notFound();

  // Check for active deal
  const now = new Date();
  const activeDeal = await cacheOrQuery<any>(`product:deal:${product._id}`, async () => {
    return TodaysDeal.findOne({
      product: product._id,
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).lean();
  }, 300);

  // Fetch related products (same category or brand)
  const relatedProducts = await cacheOrQuery<any[]>(`product:related:${product._id}`, async () => {
    return Product.find({
      _id: { $ne: product._id },
      isActive: true,
      deletedAt: null,
      $or: [
        { category: product.category },
        ...(product.brand ? [{ brand: product.brand }] : []),
        ...(product.tags?.length ? [{ tags: { $in: product.tags } }] : []),
      ],
    })
      .populate("category", "name slug")
      .sort({ purchaseCount: -1, createdAt: -1 })
      .limit(8)
      .lean();
  }, 3600);

  // Serialize for client components
  const serialized = typeof product.createdAt === 'string' ? product : JSON.parse(JSON.stringify(product));
  const serializedRelated = typeof relatedProducts[0]?.createdAt === 'string' ? relatedProducts : JSON.parse(JSON.stringify(relatedProducts));
  const serializedDeal = activeDeal ? (typeof activeDeal.createdAt === 'string' ? activeDeal : JSON.parse(JSON.stringify(activeDeal))) : null;

  return (
    <div className="min-h-screen bg-[#F2F4F8] relative overflow-hidden font-sans">
      <Header />

      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#111 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ef4a23]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Diagonal Speed Lines */}
      <div className="absolute top-20 left-0 w-full h-[600px] pointer-events-none overflow-hidden opacity-10">
         <div className="absolute top-0 left-[-10%] w-[120%] h-[2px] bg-[#ef4a23] rotate-[-5deg] blur-[1px]" />
         <div className="absolute top-40 left-[-10%] w-[120%] h-[1px] bg-[#ef4a23] rotate-[-5deg]" />
         <div className="absolute top-[400px] left-[-10%] w-[120%] h-[3px] bg-[#081621] rotate-[-5deg] blur-[2px]" />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 relative z-10">
        <VariantSelector product={serialized} deal={serializedDeal} />

        {/* Technical Specs Section */}
        <div className="relative mt-24">
           <div className="absolute -left-12 top-0 bottom-0 w-1 bg-[#ef4a23] opacity-20 hidden lg:block" />
           <ProductSpecifications specifications={serialized.specifications || []} />
        </div>

        {/* Reviews Section */}
        <div className="mt-24">
           <ReviewSection productId={serialized._id} />
        </div>

        {/* Related Gear */}
        <div className="mt-24 pb-12">
           <div className="mb-10 flex items-center justify-between">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#081621]">
                 Related <span className="text-[#ef4a23]">Gear</span>
              </h2>
              <div className="flex-1 h-[2px] bg-[#eee] ml-8 relative">
                 <div className="absolute left-0 top-0 h-full w-24 bg-[#ef4a23]" />
              </div>
           </div>
           <RelatedProducts products={serializedRelated} />
        </div>
      </main>

      <Footer />

      {/* Floating Elements */}
      <WhatsAppButton
        productName={serialized.name}
        productUrl={`/product/${serialized.slug}`}
        variant="floating"
      />
    </div>
  );
}

