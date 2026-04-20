import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import { generateOrderNumber } from "@/lib/utils";

// GET /api/orders
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const isAdmin = session.user.role === "admin";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (!isAdmin) {
      query.user = session.user.id;
    }
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Place order
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Validate stock and compute totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of body.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      const variant = product.variants.find(
        (v: { sku: string }) => v.sku === item.sku
      );
      if (!variant) {
        return NextResponse.json(
          { success: false, error: `Variant ${item.sku} not found` },
          { status: 400 }
        );
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${product.name} (${item.sku}). Available: ${variant.stock}`,
          },
          { status: 400 }
        );
      }

      // Decrement stock
      variant.stock -= item.quantity;

      // Increment purchase count
      product.purchaseCount = (product.purchaseCount || 0) + item.quantity;
      await product.save();

      const itemSubtotal = variant.price * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        product: product._id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images?.[0]?.url || "",
        variant: {
          sku: variant.sku,
          combination: Object.fromEntries(variant.combination),
          price: variant.price,
        },
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Validate coupon if present
    let discount = 0;
    let appliedCoupon = null;

    if (body.couponCode) {
      const coupon = await Coupon.findOne({ code: body.couponCode.toUpperCase() });
      if (coupon && coupon.isActive && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
        
        let validUserLimit = true;
        if (coupon.usageLimitPerUser) {
          const userCount = await Order.countDocuments({ user: session.user.id, couponCode: coupon.code });
          if (userCount >= coupon.usageLimitPerUser) {
            validUserLimit = false;
          }
        }

        if (validUserLimit && (!coupon.minimumPurchaseAmount || subtotal >= coupon.minimumPurchaseAmount)) {
          
          let applicableSubtotal = subtotal;
          if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
            const applicableIds = coupon.applicableProducts.map((id: any) => id.toString());
            applicableSubtotal = validatedItems.reduce((sum, item) => {
              if (applicableIds.includes(item.product.toString())) {
                return sum + item.subtotal;
              }
              return sum;
            }, 0);
          }

          if (applicableSubtotal > 0) {
            appliedCoupon = coupon;
            if (coupon.discountType === "fixed_amount") {
              discount = Math.min(coupon.discountValue, applicableSubtotal);
            } else {
              discount = Math.round((applicableSubtotal * coupon.discountValue) / 100);
            }
          }
        }
      }
    }

    const shippingCost = subtotal >= 5000 ? 0 : 120;
    const finalTotal = subtotal - discount + shippingCost;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: session.user.id,
      items: validatedItems,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod || "cod",
      subtotal,
      shippingCost,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      total: Math.max(0, finalTotal),
      trackingHistory: [
        {
          status: "pending",
          message: "Your order has been placed successfully.",
          timestamp: new Date(),
        },
      ],
    });

    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place order" },
      { status: 500 }
    );
  }
}
