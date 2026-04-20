import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

// GET /api/recycle-bin - Get all soft-deleted items
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";

    const filter = { deletedAt: { $ne: null } };

    const results: Record<string, unknown[]> = {};

    if (type === "all" || type === "product") {
      results.products = await Product.find(filter)
        .select("name slug images basePrice totalStock deletedAt createdAt")
        .populate("category", "name")
        .sort({ deletedAt: -1 })
        .lean();
    }

    if (type === "all" || type === "category") {
      results.categories = await Category.find(filter)
        .select("name slug icon deletedAt createdAt")
        .sort({ deletedAt: -1 })
        .lean();
    }

    if (type === "all" || type === "brand") {
      results.brands = await Brand.find(filter)
        .select("name slug logo deletedAt createdAt")
        .sort({ deletedAt: -1 })
        .lean();
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Recycle bin GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recycle bin" },
      { status: 500 }
    );
  }
}
