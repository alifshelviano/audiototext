// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/database/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  console.log("🔍 Reset password API called");

  try {
    const { token, password } = await req.json();

    console.log("📨 Request body:", { token, passwordLength: password?.length });

    // Validate input
    if (!token || !password) {
      console.log("❌ Missing fields:", { token: !!token, password: !!password });
      return NextResponse.json(
        {
          error: "Token and password are required",
          details: { tokenProvided: !!token, passwordProvided: !!password },
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      console.log("❌ Password too short:", password.length);
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user with valid reset token (matching your forgot-password implementation)
    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // Check if token hasn't expired
    });

    console.log("🔑 User with reset token found:", user ? "Yes" : "No");

    if (!user) {
      console.log("❌ Invalid, expired, or already used token");
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    console.log("✅ Token validation passed");

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("🔒 Password hashed successfully");

    // Update user's password and clear reset token
    const result = await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: "",
        },
      }
    );

    if (result.modifiedCount === 0) {
      console.log("❌ Failed to update user password");
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    console.log(`🎉 Password successfully reset for user: ${user.email}`);

    return NextResponse.json({
      message: "Password reset successfully",
      success: true,
    });
  } catch (error) {
    console.error("💥 Password reset error:", error);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
