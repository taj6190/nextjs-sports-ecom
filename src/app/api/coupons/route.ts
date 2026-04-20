import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { code, discountType, discountValue, minimumPurchaseAmount, applicableProducts, usageLimit, usageLimitPerUser } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ success: false, error: "Code, type, and value are required" }, { status: 400 });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ success: false, error: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minimumPurchaseAmount: minimumPurchaseAmount ? Number(minimumPurchaseAmount) : 0,
      applicableProducts: Array.isArray(applicableProducts) ? applicableProducts : [],
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser) : undefined,
    });

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error: any) {
    console.error("Coupons POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}
