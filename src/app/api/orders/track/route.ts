import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim();
    const noHashQuery = cleanQuery.replace("#", "");

    // Find the latest order matching orderNumber (flexible) OR phone OR email
    const order = await Order.findOne({ 
      $or: [
        { orderNumber: cleanQuery },
        { orderNumber: noHashQuery },
        { orderNumber: `#${noHashQuery}` },
        { orderNumber: `ELM-${noHashQuery}` },
        { "shippingAddress.phone": cleanQuery },
        { "shippingAddress.email": cleanQuery.toLowerCase() }
      ]
    })
    .sort({ createdAt: -1 })
    .populate("user", "name")
    .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "No matching order found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order status" },
      { status: 500 }
    );
  }
}
