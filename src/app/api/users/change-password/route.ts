// app/api/users/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current password and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "New password must be at least 8 characters long" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user by ID
    const user = await db.collection("users").findOne({
      _id: new ObjectId(token.sub),
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify current password
    if (!user.password) {
      return NextResponse.json({ message: "Password authentication not available for this account" }, { status: 400 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(token.sub) },
      {
        $set: {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "Failed to update password" }, { status: 500 });
    }

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
