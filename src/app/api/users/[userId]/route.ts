// app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/users/[userId]
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Await params first
    const { userId } = await params;
    const token = await getToken({ req });

    if (!token || token.sub !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/users/[userId]
export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Await params first
    const { userId } = await params;
    const token = await getToken({ req });

    if (!token || token.sub !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password, _id, createdAt, ...updateData } = body; // Prevent updating sensitive fields

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
        includeResultMetadata: true,
      }
    );

    // Check if the update was successful and document was found
    if (!result || !result.value) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updatedUser = result.value;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
