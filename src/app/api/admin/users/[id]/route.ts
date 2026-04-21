import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await dbConnect();
  const user = await User.findById(id).select("-password");
  if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: user });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { name, email, role, phone, password } = await req.json();
  await dbConnect();
  const user = await User.findById(id);
  if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (phone !== undefined) user.phone = phone;
  if (password) user.password = await bcrypt.hash(password, 12);
  await user.save();
  return NextResponse.json({ success: true, message: "User updated" });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (session.user.id === id) {
    return NextResponse.json({ success: false, message: "Cannot delete yourself" }, { status: 400 });
  }
  await dbConnect();
  const user = await User.findByIdAndDelete(id);
  if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  return NextResponse.json({ success: true, message: "User deleted" });
}
