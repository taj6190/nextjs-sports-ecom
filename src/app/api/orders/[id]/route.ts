import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

// GET /api/orders/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const order = await Order.findById(id).populate("user", "name email").lean();
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check ownership
    const isAdmin = session.user.role === "admin";
    if (!isAdmin && order.user._id.toString() !== session.user?.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order status with tracking (admin only)
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

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // If cancelling, restore stock
    if (body.orderStatus === "cancelled" && order.orderStatus !== "cancelled") {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const variant = product.variants.find(
            (v: { sku: string }) => v.sku === item.variant.sku
          );
          if (variant) {
            variant.stock += item.quantity;
            await product.save();
          }
        }
      }
    }

    // If delivered, mark as paid for COD
    if (body.orderStatus === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }

    // Update status
    const oldStatus = order.orderStatus;
    order.orderStatus = body.orderStatus || order.orderStatus;
    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
    if (body.trackingNumber) order.trackingNumber = body.trackingNumber;
    if (body.estimatedDelivery) order.estimatedDelivery = body.estimatedDelivery;
    if (body.notes) order.notes = body.notes;

    // Add tracking history entry
    if (body.orderStatus && body.orderStatus !== oldStatus) {
      const statusMessages: Record<string, string> = {
        confirmed: "Your order has been confirmed and is being prepared.",
        processing: "Your order is being processed and packed.",
        shipped: body.trackingNumber
          ? `Your order has been shipped. Tracking: ${body.trackingNumber}`
          : "Your order has been shipped and is on its way.",
        delivered: "Your order has been delivered successfully.",
        cancelled: body.notes || "Your order has been cancelled.",
      };

      order.trackingHistory.push({
        status: body.orderStatus,
        message: body.trackingMessage || statusMessages[body.orderStatus] || `Order status updated to ${body.orderStatus}`,
        timestamp: new Date(),
      });
    }

    await order.save();

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
