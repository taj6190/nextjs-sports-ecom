import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { orderNumber, phoneOrEmail } = await req.json();

    if (!orderNumber || !phoneOrEmail) {
      return NextResponse.json(
        { success: false, error: "Order number and phone/email are required" },
        { status: 400 }
      );
    }

    // Try to find the order by orderNumber
    // Then verify if either shippingAddress.phone or shippingAddress.email matches
    const order = await Order.findOne({ 
      orderNumber: orderNumber.replace("#", "").trim(),
      $or: [
        { "shippingAddress.phone": phoneOrEmail.trim() },
        { "shippingAddress.email": phoneOrEmail.trim().toLowerCase() }
      ]
    }).populate("user", "name").lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found or details mismatch" },
        { status: 404 }
      );
    }

    // Return the order but maybe strip some ultra-sensitive details if necessary
    // For now, returning the status and history is the goal
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order status" },
      { status: 500 }
    );
  }
}
