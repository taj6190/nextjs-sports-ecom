import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VariantSelector from "@/components/product/VariantSelector";
import RelatedProducts from "@/components/product/RelatedProducts";
import WhatsAppButton from "@/components/product/WhatsAppButton";
import ProductSpecifications from "@/components/product/ProductSpecifications";
import ReviewSection from "@/components/product/ReviewSection";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import TodaysDeal from "@/models/TodaysDeal";
import "@/models/Category";
import type { Metadata } from "next";
import { cacheOrQuery } from "@/lib/redis";

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
    <div className="min-h-screen bg-[#F2F4F8]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <VariantSelector product={serialized} deal={serializedDeal} />

        {/* Specifications Table (StarTech-style) */}
        <ProductSpecifications specifications={serialized.specifications || []} />

        {/* Reviews & Ratings */}
        <ReviewSection productId={serialized._id} />

        <RelatedProducts products={serializedRelated} />
      </main>
      <Footer />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton
        productName={serialized.name}
        productUrl={`/product/${serialized.slug}`}
        variant="floating"
      />
    </div>
  );
}
