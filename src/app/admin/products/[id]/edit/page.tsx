import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import ProductForm from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await dbConnect();
  const { id } = await params;

  const product = await Product.findById(id).lean();
  if (!product) notFound();

  const serialized = JSON.parse(JSON.stringify(product));

  // Transform variants for the form
  const formData = {
    _id: serialized._id,
    name: serialized.name,
    description: serialized.description || "",
    brand: serialized.brand || "",
    category: serialized.category || "",
    images: serialized.images || [],
    attributes: serialized.attributes || [],
    variants: (serialized.variants || []).map((v: { sku: string; combination: Record<string, string> | Map<string, string>; price: number; discountPrice: number; stock: number; images: { url: string; publicId: string; alt: string }[]; isActive: boolean }) => ({
      sku: v.sku,
      combination: v.combination instanceof Map ? Object.fromEntries(v.combination) : v.combination,
      price: v.price,
      discountPrice: v.discountPrice || 0,
      stock: v.stock,
      images: v.images || [],
      isActive: v.isActive,
    })),
    isFeatured: serialized.isFeatured || false,
    tags: serialized.tags || [],
    seo: serialized.seo || { title: "", description: "" },
    slug: serialized.slug || "",
    specifications: serialized.specifications || [],
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Edit Product</h1>
        <p className="text-sm text-slate-500 mt-1">{serialized.name}</p>
      </div>
      <ProductForm initialData={formData} />
    </div>
  );
}
