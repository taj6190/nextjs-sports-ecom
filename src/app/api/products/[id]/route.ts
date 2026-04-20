import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { slugify } from "@/lib/utils";

// GET /api/products/[id] - Get single product by ID or slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const related = searchParams.get("related") === "true";

    // Try to find by slug first, then by ID
    let product = await Product.findOne({ slug: id, isActive: true, deletedAt: null })
      .populate("category", "name slug icon")
      .lean();

    if (!product) {
      product = await Product.findById(id)
        .populate("category", "name slug icon")
        .lean();
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch related products if requested
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let relatedProducts: any[] = [];
    if (related) {
      relatedProducts = await Product.find({
        _id: { $ne: product._id },
        isActive: true,
        deletedAt: null,
        $or: [
          { category: product.category },
          { brand: product.brand },
          { tags: { $in: product.tags || [] } },
        ],
      })
        .populate("category", "name slug")
        .sort({ purchaseCount: -1, createdAt: -1 })
        .limit(8)
        .lean();
    }

    return NextResponse.json({
      success: true,
      data: product,
      ...(related && { relatedProducts }),
    });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Update slug if explicitly provided, else fallback to name
    if (body.slug) {
      body.slug = slugify(body.slug);
    } else {
      body.slug = slugify(body.name || product.name);
    }

    Object.assign(product, body);
    await product.save(); // Triggers pre-save hooks for price/stock computation

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Soft delete (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Product moved to recycle bin" });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
