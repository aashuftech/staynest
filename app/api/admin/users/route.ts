import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Counter } from "@/lib/models/Counter";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN" ? session : null;
}

async function normalizePublicIdsOnce() {
  // The prior counter was accidentally advanced during earlier backfills.
  // This marker makes the #1 reset run exactly once for the current database.
  const markerKey = "user-public-id-normalized-v1";
  const alreadyNormalized = await Counter.findOne({ key: markerKey }).lean();
  if (alreadyNormalized) return;

  const users = await User.collection
    .find({ role: "USER" })
    .sort({ createdAt: 1, _id: 1 })
    .project({ _id: 1 })
    .toArray();

  if (users.length) {
    await User.collection.bulkWrite(
      users.map((user, index) => ({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { publicId: index + 1 } },
        },
      })),
    );
  }

  // The next registered normal user receives the immediately following ID.
  await Counter.findOneAndUpdate(
    { key: "user-public-id" },
    { $set: { value: users.length } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  await Counter.findOneAndUpdate(
    { key: markerKey },
    { $set: { value: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin()))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    await normalizePublicIdsOnce();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const query: any = {};

    if (search) {
      const requestedId = Number(search.replace(/^#/, ""));
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        ...(Number.isInteger(requestedId) && requestedId > 0
          ? [{ publicId: requestedId }]
          : []),
      ];
    }

    const users = await User.collection
      .find(query)
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin user list error:", error);
    return NextResponse.json(
      { error: "Unable to load users." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId, action } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(userId))
      return NextResponse.json({ error: "Invalid user." }, { status: 400 });
    if (action !== "BAN" && action !== "UNBAN")
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });

    await connectDB();
    const _id = new mongoose.Types.ObjectId(userId);
    const user = await User.collection.findOne(
      { _id },
      { projection: { role: 1 } },
    );

    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (user.role === "ADMIN")
      return NextResponse.json(
        { error: "Admin accounts cannot be banned." },
        { status: 403 },
      );
    if (String(_id) === String((session.user as any).id))
      return NextResponse.json(
        { error: "You cannot ban your own account." },
        { status: 403 },
      );

    const isBanned = action === "BAN";
    await User.collection.updateOne(
      { _id },
      { $set: { isBanned, bannedAt: isBanned ? new Date() : null } },
    );

    return NextResponse.json({ user: { _id: String(_id), isBanned } });
  } catch (error) {
    console.error("Admin user ban error:", error);
    return NextResponse.json(
      { error: "Unable to update user status." },
      { status: 500 },
    );
  }
}
