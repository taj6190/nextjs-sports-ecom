import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";

// PATCH /api/admin/reviews/[id] - Update review (approve/reject)
export async function PATCH(
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

    const review = await Review.findByIdAndUpdate(id, body, { new: true });
    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    // Recalculate product rating
    const allReviews = await Review.find({ product: review.product, isApproved: true });
    const count = allReviews.length;
    const avg = count > 0
      ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0;
    await Product.findByIdAndUpdate(review.product, { avgRating: avg, reviewCount: count });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("Admin review PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE /api/admin/reviews/[id] - Delete review
export async function DELETE(
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

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    // Recalculate product rating after deletion
    const allReviews = await Review.find({ product: review.product, isApproved: true });
    const count = allReviews.length;
    const avg = count > 0
      ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0;
    await Product.findByIdAndUpdate(review.product, { avgRating: avg, reviewCount: count });

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Admin review DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete review" }, { status: 500 });
  }
}
