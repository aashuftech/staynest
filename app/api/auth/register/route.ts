import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { nextUserPublicId } from "@/lib/user-public-id";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    if (password.length < 6)
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    await connectDB();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    const hashed = await bcrypt.hash(password, 10);
    const publicId = await nextUserPublicId();
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "USER",
      publicId,
    });
    return NextResponse.json(
      {
        user: {
          id: user._id,
          publicId: user.publicId,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
