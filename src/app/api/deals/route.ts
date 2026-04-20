import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import TodaysDeal from "@/models/TodaysDeal";

// GET /api/deals
export async function GET() {
  try {
    await dbConnect();
    const now = new Date();

    const deals = await TodaysDeal.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    })
      .populate({
        path: "product",
        select: "name slug images basePrice totalStock category brand",
        populate: { path: "category", select: "name slug" },
      })
      .sort({ endTime: 1 })
      .lean();

    return NextResponse.json({ success: true, data: deals });
  } catch (error) {
    console.error("Deals GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

// POST /api/deals (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const deal = await TodaysDeal.create(body);
    return NextResponse.json({ success: true, data: deal }, { status: 201 });
  } catch (error) {
    console.error("Deals POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create deal" },
      { status: 500 }
    );
  }
}

// PUT /api/deals
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;

    const deal = await TodaysDeal.findByIdAndUpdate(_id, updateData, { new: true });
    if (!deal) {
      return NextResponse.json({ success: false, error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deal });
  } catch (error) {
    console.error("Deals PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update deal" },
      { status: 500 }
    );
  }
}

// DELETE /api/deals
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

    await TodaysDeal.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deal deleted" });
  } catch (error) {
    console.error("Deals DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}
