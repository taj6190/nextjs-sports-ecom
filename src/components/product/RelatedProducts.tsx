"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import type { IProduct } from "@/types";
import { FiArrowRight } from "react-icons/fi";

interface RelatedProductsProps {
  products: IProduct[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">You May Also Like</h2>
          <p className="text-sm text-slate-500 mt-1">Related products based on this item</p>
        </div>
        <Link href="/shop" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
          View All <FiArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
