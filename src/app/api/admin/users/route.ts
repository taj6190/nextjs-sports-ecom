import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const users = await User.find({}).sort({ createdAt: -1 }).select("-password");
  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const { name, email, password, role, phone } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ success: false, message: "Required fields missing" }, { status: 400 });
  }
  await dbConnect();
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ success: false, message: "Email already registered" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashed, role: role || "user", phone: phone || "" });
  return NextResponse.json({ success: true, message: "User created" }, { status: 201 });
}
