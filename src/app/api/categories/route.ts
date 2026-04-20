import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { slugify } from "@/lib/utils";
import { cacheOrQuery, redis } from "@/lib/redis";

// GET /api/categories - with subcategory support
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const tree = searchParams.get("tree") === "true";
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const cacheKey = `categories_api:tree=${tree}:incDel=${includeDeleted}`;

    // Cache categories query for 1 hour
    const data = await cacheOrQuery(cacheKey, async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: any = {};

      if (!includeDeleted) {
        filter.isActive = true;
        filter.deletedAt = null;
      }

      const categories = await Category.find(filter)
        .sort({ name: 1 })
        .lean();

      if (tree) {
        // Build category tree: parent categories with their children
        const parentCategories = categories.filter((c) => !c.parent);
        const categoryTree = parentCategories.map((parent) => ({
          ...parent,
          children: categories.filter(
            (c) => c.parent && c.parent.toString() === parent._id.toString()
          ),
        }));
        return categoryTree;
      }

      return categories;
    }, 3600);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

async function clearCategoryCache() {
  if (!redis) return;
  try {
    const keys = await redis.keys("categories_api:*");
    if (keys.length > 0) await redis.del(...keys);
    await redis.del("home:categories");
  } catch (err) {
    console.error("Failed to clear category cache", err);
  }
}

// POST /api/categories (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);

    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Category already exists" },
        { status: 400 }
      );
    }

    const category = await Category.create({
      ...body,
      slug,
      parent: body.parent || null,
    });
    
    await clearCategoryCache();
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT /api/categories (admin only) - update by id in body
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
    } else if (updateData.name || updateData.slug === "") {
      // If slug is explicitly empty or name was updated, generate slug
      const cat = await Category.findById(_id);
      updateData.slug = slugify(updateData.name || cat?.name || "");
    }

    const category = await Category.findByIdAndUpdate(_id, updateData, { new: true });
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    await clearCategoryCache();
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Categories PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories (soft delete)
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    await Category.findByIdAndUpdate(id, { isActive: false, deletedAt: new Date() });
    
    await clearCategoryCache();
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Categories DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
