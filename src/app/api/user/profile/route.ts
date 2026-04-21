import dbConnect from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, currentPassword, newPassword } = await req.json();

    await dbConnect();

    // Fetch user with password selected
    const user = await User.findById(session.user.id).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Logic: Authenticate and Update Password if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, message: "Current password required" }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: "Incorrect current password" }, { status: 400 });
      }

      // Hash and set new tactical password
      user.password = await bcrypt.hash(newPassword, 12);
    }

    // Update Core Ident (Name)
    if (name) {
      user.name = name;
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: "Tactical data synchronized successfully." 
    });

  } catch (error: any) {
    console.error("Profile synchronization error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal terminal error during synchronization." 
    }, { status: 500 });
  }
}
