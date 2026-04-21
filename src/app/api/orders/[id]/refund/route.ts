import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

// POST /api/orders/[id]/refund (admin only)
export async function POST(
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
    const { amount, reason } = await req.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Validation
    const refundAmount = Number(amount);
    if (isNaN(refundAmount) || refundAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid refund amount" }, { status: 400 });
    }

    const currentRefunded = order.refundedAmount || 0;
    const remainingToRefund = order.total - currentRefunded;

    if (refundAmount > remainingToRefund) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot refund more than remaining total (${remainingToRefund})` 
      }, { status: 400 });
    }

    // Process Refund Record
    order.refunds.push({
      amount: refundAmount,
      reason: reason || "No reason provided",
      status: "completed",
      timestamp: new Date(),
      processedBy: session.user.id,
    });

    order.refundedAmount = currentRefunded + refundAmount;
    order.isRefunded = true;

    // Add entry to tracking history
    order.trackingHistory.push({
      status: "refunded",
      message: `A refund of ${refundAmount} has been processed. Reason: ${reason || "N/A"}`,
      timestamp: new Date(),
    });

    await order.save();

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order Refund POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
