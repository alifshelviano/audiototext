// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user by email
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal whether email exists or not for security
      return NextResponse.json(
        {
          message: "If an account with that email exists, we have sent a password reset link.",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        },
      }
    );

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    console.log("🔗 Password reset link:", resetLink); // For testing

    // Send email (comment out for testing)
    try {
      await sendPasswordResetEmail(email, resetToken);
      console.log("📧 Password reset email sent to:", email);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json(
      {
        message: "If an account with that email exists, we have sent a password reset link.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        message: "An error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
