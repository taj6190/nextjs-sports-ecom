import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

// POST /api/bulk - Bulk operations (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { action, type, ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "No items selected" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Model: any;
    switch (type) {
      case "product":
        Model = Product;
        break;
      case "category":
        Model = Category;
        break;
      case "brand":
        Model = Brand;
        break;
      default:
        return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
    }

    let result;

    switch (action) {
      case "delete":
        // Soft delete - move to recycle bin
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { isActive: false, deletedAt: new Date() }
        );
        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} items moved to recycle bin`,
        });

      case "activate":
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { isActive: true }
        );
        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} items activated`,
        });

      case "deactivate":
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { isActive: false }
        );
        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} items deactivated`,
        });

      case "feature":
        if (type !== "product") {
          return NextResponse.json({ success: false, error: "Only products can be featured" }, { status: 400 });
        }
        result = await Product.updateMany(
          { _id: { $in: ids } },
          { isFeatured: true }
        );
        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} products featured`,
        });

      case "unfeature":
        if (type !== "product") {
          return NextResponse.json({ success: false, error: "Only products can be unfeatured" }, { status: 400 });
        }
        result = await Product.updateMany(
          { _id: { $in: ids } },
          { isFeatured: false }
        );
        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} products unfeatured`,
        });

      case "permanent_delete":
        result = await Model.deleteMany({ _id: { $in: ids } });
        return NextResponse.json({
          success: true,
          message: `${result.deletedCount} items permanently deleted`,
        });

      case "restore":
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { isActive: true, deletedAt: null }
        );
        return NextResponse.json({
          success: true,
          message: `${result.modifiedCount} items restored`,
        });

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      { success: false, error: "Bulk operation failed" },
      { status: 500 }
    );
  }
}
