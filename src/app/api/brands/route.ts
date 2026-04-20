import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Brand from "@/models/Brand";
import { slugify } from "@/lib/utils";

// GET /api/brands
export async function GET() {
  try {
    await dbConnect();
    const brands = await Brand.find({ isActive: true, deletedAt: null })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error("Brands GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// POST /api/brands (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);

    const existing = await Brand.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Brand already exists" },
        { status: 400 }
      );
    }

    const brand = await Brand.create({ ...body, slug });
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error) {
    console.error("Brands POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create brand" },
      { status: 500 }
    );
  }
}

// PUT /api/brands
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
      const cat = await Brand.findById(_id);
      updateData.slug = slugify(updateData.name || cat?.name || "");
    }

    const brand = await Brand.findByIdAndUpdate(_id, updateData, { new: true });
    if (!brand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error("Brands PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

// DELETE /api/brands (soft delete)
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

    await Brand.findByIdAndUpdate(id, { isActive: false, deletedAt: new Date() });
    return NextResponse.json({ success: true, message: "Brand deleted" });
  } catch (error) {
    console.error("Brands DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
