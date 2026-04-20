import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { code, cartItems } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return NextResponse.json({ success: false, error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ success: false, error: "This coupon is no longer active" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    if (coupon.usageLimitPerUser) {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ success: false, error: "You must be logged in to use this coupon." }, { status: 401 });
      }
      
      const userUsageCount = await Order.countDocuments({ 
        user: session.user.id, 
        couponCode: coupon.code 
      });

      if (userUsageCount >= coupon.usageLimitPerUser) {
        return NextResponse.json({ success: false, error: "You have exceeded the usage limit for this coupon." }, { status: 400 });
      }
    }

    // 1. Calculate overall cart subtotal
    const cartSubtotal = cartItems.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    );

    // 2. Minimum purchase threshold
    if (coupon.minimumPurchaseAmount && cartSubtotal < coupon.minimumPurchaseAmount) {
      return NextResponse.json(
        { success: false, error: `Minimum purchase of ৳${coupon.minimumPurchaseAmount} required` },
        { status: 400 }
      );
    }

    // 3. Find subtotal of applicable products
    let applicableSubtotal = cartSubtotal; // Default applies to all

    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const applicableIds = coupon.applicableProducts.map((id: any) => id.toString());
      applicableSubtotal = cartItems.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, item: any) => {
          if (applicableIds.includes(item.productId)) {
            return sum + (item.price * item.quantity);
          }
          return sum;
        },
        0
      );

      if (applicableSubtotal === 0) {
        return NextResponse.json(
          { success: false, error: "Coupon is not applicable to any items in your cart" },
          { status: 400 }
        );
      }
    }

    // 4. Calculate final discount amount
    let discountAmount = 0;
    if (coupon.discountType === "fixed_amount") {
      discountAmount = Math.min(coupon.discountValue, applicableSubtotal);
    } else {
      discountAmount = Math.round((applicableSubtotal * coupon.discountValue) / 100);
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount,
      },
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json({ success: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}

