import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";

// GET /api/reviews?product=ID - Get reviews for a product
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product");

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const reviews = await Review.find({ product: productId, isApproved: true })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const total = reviews.length;
    const avgRating = total > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
      : 0;

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: { avgRating, total, distribution },
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews - Create a review (authenticated)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "You must be logged in to write a review" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { productId, rating, title, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ success: false, error: "Product, rating, and comment are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({ user: session.user.id, product: productId });
    if (existing) {
      return NextResponse.json({ success: false, error: "You have already reviewed this product" }, { status: 400 });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const review = await Review.create({
      user: session.user.id,
      product: productId,
      rating: Number(rating),
      title: title || "",
      comment,
    });

    // Update product avgRating and reviewCount
    const allReviews = await Review.find({ product: productId, isApproved: true });
    const count = allReviews.length;
    const avg = count > 0
      ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0;

    await Product.findByIdAndUpdate(productId, { avgRating: avg, reviewCount: count });

    const populated = await Review.findById(review._id).populate("user", "name").lean();

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error: any) {
    console.error("Reviews POST error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "You have already reviewed this product" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create review" }, { status: 500 });
  }
}
