import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Attribute from "@/models/Attribute";

// GET /api/attributes
export async function GET() {
  try {
    await dbConnect();
    const attributes = await Attribute.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: attributes });
  } catch (error) {
    console.error("Attributes GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attributes" },
      { status: 500 }
    );
  }
}

// POST /api/attributes (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const existing = await Attribute.findOne({ name: body.name });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Attribute already exists" },
        { status: 400 }
      );
    }

    const attribute = await Attribute.create(body);
    return NextResponse.json({ success: true, data: attribute }, { status: 201 });
  } catch (error) {
    console.error("Attributes POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create attribute" },
      { status: 500 }
    );
  }
}

// PUT /api/attributes (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;

    const attribute = await Attribute.findByIdAndUpdate(_id, updateData, { new: true });
    if (!attribute) {
      return NextResponse.json(
        { success: false, error: "Attribute not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: attribute });
  } catch (error) {
    console.error("Attributes PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update attribute" },
      { status: 500 }
    );
  }
}

// DELETE /api/attributes
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

    await Attribute.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Attribute deleted" });
  } catch (error) {
    console.error("Attributes DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete attribute" },
      { status: 500 }
    );
  }
}
