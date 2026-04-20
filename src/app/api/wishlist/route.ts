import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

// GET /api/wishlist - Get user's wishlist product IDs
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, data: [] });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select("wishlist").lean();

    return NextResponse.json({
      success: true,
      data: user?.wishlist?.map((id: any) => id.toString()) || [],
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST /api/wishlist - Toggle a product in wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Login required" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const index = user.wishlist.findIndex((id: any) => id.toString() === productId);
    let action: "added" | "removed";

    if (index > -1) {
      user.wishlist.splice(index, 1);
      action = "removed";
    } else {
      user.wishlist.push(productId);
      action = "added";
    }

    await user.save();

    return NextResponse.json({
      success: true,
      data: user.wishlist.map((id: any) => id.toString()),
      action,
    });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to update wishlist" }, { status: 500 });
  }
}
