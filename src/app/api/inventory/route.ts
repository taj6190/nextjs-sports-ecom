import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

// GET /api/inventory - Dashboard inventory overview
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const products = await Product.find({ isActive: true })
      .select("name slug variants totalStock")
      .lean();

    const LOW_STOCK_THRESHOLD = 5;

    const inventory = products.flatMap((product) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      product.variants.map((variant: any) => ({
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        sku: variant.sku,
        combination: variant.combination,
        stock: variant.stock,
        price: variant.price,
        isLowStock: variant.stock <= LOW_STOCK_THRESHOLD,
        isOutOfStock: variant.stock === 0,
      }))
    );

    // Sort: out of stock first, then low stock
    inventory.sort((a, b) => {
      if (a.isOutOfStock && !b.isOutOfStock) return -1;
      if (!a.isOutOfStock && b.isOutOfStock) return 1;
      if (a.isLowStock && !b.isLowStock) return -1;
      if (!a.isLowStock && b.isLowStock) return 1;
      return a.stock - b.stock;
    });

    const stats = {
      totalProducts: products.length,
      totalVariants: inventory.length,
      outOfStock: inventory.filter((i) => i.isOutOfStock).length,
      lowStock: inventory.filter((i) => i.isLowStock && !i.isOutOfStock).length,
    };

    return NextResponse.json({ success: true, data: inventory, stats });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// PUT /api/inventory - Bulk update stock (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    // body.updates: [{ productId, sku, stock }]

    for (const update of body.updates) {
      const product = await Product.findById(update.productId);
      if (product) {
        const variant = product.variants.find(
          (v: { sku: string }) => v.sku === update.sku
        );
        if (variant) {
          variant.stock = update.stock;
          await product.save();
        }
      }
    }

    return NextResponse.json({ success: true, message: "Stock updated" });
  } catch (error) {
    console.error("Inventory PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}
