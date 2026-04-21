import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import SortSelector from "@/components/product/SortSelector";
import dbConnect from "@/lib/db";
import Attribute from "@/models/Attribute";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Link from "next/link";
import { Suspense } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

/* ─── Breadcrumb ─────────────────────────────────────────────────────────── */
function Breadcrumb({ label }: { label: string }) {
  return (
    <div className="bg-white border-b border-[#e0e0e0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-[12px] text-[#666]">
        <Link href="/" className="hover:text-[#ef4a23] transition-colors">
          Home
        </Link>
        <span className="text-[#bbb]">›</span>
        <span className="text-[#333] font-medium">{label}</span>
      </div>
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────────────────────── */
function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const range: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) range.push(i);
  } else {
    range.push(1);
    if (page > 3) range.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      range.push(i);
    if (page < totalPages - 2) range.push("…");
    range.push(totalPages);
  }

  const makeHref = (p: number) =>
    `/shop?${new URLSearchParams({
      ...(params as Record<string, string>),
      page: String(p),
    })}`;

  const base =
    "flex items-center justify-center min-w-[32px] h-8 px-1.5 border border-[#ddd] bg-white text-[#555] text-[12px] font-semibold hover:bg-[#ef4a23] hover:text-white hover:border-[#ef4a23] transition-colors";

  return (
    <div className="flex items-center justify-center gap-1 mt-6 border-t border-[#ddd] pt-6">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className={base}>
          <FiChevronLeft size={14} />
        </Link>
      ) : (
        <span className={`${base} opacity-40 cursor-not-allowed pointer-events-none`}>
          <FiChevronLeft size={14} />
        </span>
      )}

      {range.map((p, i) =>
        p === "…" ? (
          <span
            key={`e${i}`}
            className="flex items-center justify-center w-8 h-8 text-[12px] text-[#888]"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={makeHref(p as number)}
            className={`${base} ${p === page ? "bg-[#ef4a23] text-white border-[#ef4a23]" : ""}`}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={makeHref(page + 1)} className={base}>
          <FiChevronRight size={14} />
        </Link>
      ) : (
        <span className={`${base} opacity-40 cursor-not-allowed pointer-events-none`}>
          <FiChevronRight size={14} />
        </span>
      )}
    </div>
  );
}

/* ─── Shop content — pure server component ───────────────────────────────── */
async function ShopContent({ searchParams }: ShopPageProps) {
  await dbConnect();
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const limit = 20;
  const sort = params.sort || "newest";
  const { category, brand, minPrice, maxPrice, search, featured } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { isActive: true, deletedAt: null };
  if (category) query.category = category;
  if (brand) query.brand = { $regex: brand, $options: "i" };
  if (featured === "true") query.isFeatured = true;
  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  switch (sort) {
    case "price_asc":  sortObj = { basePrice: 1 };  break;
    case "price_desc": sortObj = { basePrice: -1 }; break;
    case "name_asc":   sortObj = { name: 1 };       break;
    case "name_desc":  sortObj = { name: -1 };      break;
  }

  const skip = (page - 1) * limit;

  const [products, total, categories, attributes, brands] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
    Category.find({ isActive: true, deletedAt: null }).sort({ name: 1 }).lean(),
    Attribute.find().sort({ name: 1 }).lean(),
    Product.distinct("brand", { isActive: true }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const from = total === 0 ? 0 : Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  const pageLabel =
    search
      ? `Search: "${search}"`
      : featured === "true"
      ? "Featured Products"
      : "All Products";

  // Serialise for client components — avoids passing mongoose docs to client
  const serializedCategoriesRaw = JSON.parse(JSON.stringify(categories));

  // Build recursive tree for filters
  const buildCategoryTree = (nodes: any[], parentId: string | null = null): any[] => {
    return nodes
      .filter((n) => (n.parent ? n.parent.toString() : null) === parentId)
      .map((n) => ({
        ...n,
        children: buildCategoryTree(nodes, n._id.toString()),
      }));
  };

  const categoryTree = buildCategoryTree(serializedCategoriesRaw);
  const serializedAttributes = JSON.parse(JSON.stringify(attributes));
  const filteredBrands = (brands as string[]).filter(Boolean);

  return (
    <>
      <Breadcrumb label={pageLabel} />

      {/* ── Red title bar ── */}
      <div className="bg-[#081621] border-b-[3px] border-[#ef4a23]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <h1 className="text-[16px] font-bold text-white uppercase tracking-wider">
            {pageLabel}
          </h1>
          <span className="text-[13px] text-white/80">{total} Products Found</span>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">

        {/* Mobile: filter row (Removed previous separate mobile row) */}

        <div className="flex gap-5 items-start">
          {/* ── Sidebar — desktop ── */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0 sticky top-[88px] self-start space-y-4">
             <ProductFilters
                categories={categoryTree}
                attributes={serializedAttributes}
                brands={filteredBrands}
                variant="desktop"
            />
          </aside>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0 bg-transparent">
            {/* Toolbar designed exactly like the uploaded image */}
            <div className="flex items-center justify-between bg-white border border-[#eee] shadow-sm rounded-md p-2 px-3 mb-4">
              {/* Left Side: Filter button (Mobile) or Showing text (Desktop) */}
              <div className="flex items-center">
                <div className="lg:hidden">
                  <ProductFilters
                    categories={categoryTree}
                    attributes={serializedAttributes}
                    brands={filteredBrands}
                    variant="mobile"
                  />
                </div>
                {/* Count (hidden on mobile since filter takes priority, or we can just show it) */}
                <p className="hidden lg:block text-[13px] text-[#555] ml-2">
                  Showing{" "}
                  <span className="font-semibold text-[#111]">{from}–{to}</span>
                  {" "}of{" "}
                  <span className="font-semibold text-[#111]">{total}</span>{" "}
                  results
                </p>
              </div>

              {/* Right Side: Sort dropdown */}
              <div className="flex items-center gap-3">
                <SortSelector initialSort={sort} />
              </div>
            </div>

            {/* Product grid */}
            {products.length > 0 ? (
              <div className="">
                {/*
                  StarTech hairline grid:
                  gap-[1px] + bg-[#ddd] bleeds through as 1px separators between white cards.
                */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-3">
                  {products.map((product) => (
                      <ProductCard
                        key={String(product._id)}
                        product={JSON.parse(JSON.stringify(product))}
                      />
                  ))}
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  params={params}
                />
              </div>
            ) : (
              <div className="bg-white py-24 text-center">
                <p className="text-[18px] font-bold text-[#333] mb-2 uppercase">
                  No match found
                </p>
                <p className="text-[14px] text-[#666] mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-8 py-3 bg-[#ef4a23] text-white text-[13px] font-bold uppercase tracking-wide hover:bg-[#d03d1c] transition-colors"
                >
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Loading skeleton ───────────────────────────────────────────────────── */
function ShopSkeleton() {
  return (
    <>
      <div className="h-12 bg-[#081621] border-b-[3px] border-[#ef4a23]" />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-5">
          <div className="hidden lg:block w-[240px] flex-shrink-0 space-y-3">
            {[80, 110, 170, 150].map((h, i) => (
              <div key={i} className="bg-white border border-slate-200 animate-pulse" style={{ height: h }} />
            ))}
          </div>
          <div className="flex-1 bg-white p-3">
            <div className="h-14 mb-4 bg-slate-50 border border-slate-200 animate-pulse" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 bg-slate-50 border border-slate-100 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ShopPage(props: ShopPageProps) {
  return (
    <div className="min-h-screen bg-[#F2F4F8]">
      <Header />
      <Suspense fallback={<ShopSkeleton />}>
        <ShopContent {...props} />
      </Suspense>
      <Footer />
    </div>
  );
}
