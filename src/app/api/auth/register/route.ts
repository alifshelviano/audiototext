// import { NextResponse } from 'next/server';
// import clientPromise from '@/lib/mongodb';
// import bcrypt from 'bcryptjs';
// import { ObjectId } from 'mongodb';

// export async function POST(req: Request) {
//   try {
//     console.log('Registration API called');

//     const body = await req.json();
//     console.log('Request body:', body);

//     const { name, email, password } = body;

//     if (!name || !email || !password) {
//       console.log('Missing required fields:', { name, email, password: !!password });
//       return NextResponse.json(
//         { message: 'Name, email, and password are required' },
//         { status: 400 }
//       );
//     }

//     const client = await clientPromise;
//     console.log('Connected to MongoDB');

//     const db = client.db();
//     const usersCollection = db.collection('users');

//     // Check if user already exists
//     const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       console.log('User already exists:', email);
//       return NextResponse.json(
//         { message: 'User already exists with this email' },
//         { status: 409 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);
//     console.log('Password hashed successfully');

//     const newUser = {
//       _id: new ObjectId(),
//       name: name.trim(),
//       email: email.toLowerCase().trim(),
//       password: hashedPassword,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     const result = await usersCollection.insertOne(newUser);
//     console.log('User inserted successfully:', result.insertedId);

//     return NextResponse.json(
//       {
//         message: 'User registered successfully',
//         userId: result.insertedId.toString()
//       },
//       { status: 201 }
//     );

//   } catch (error) {
//     console.error('Registration error:', error);
//     return NextResponse.json(
//       { message: 'An unexpected error occurred during registration' },
//       { status: 500 }
//     );
//   }
// }

// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Check for existing user
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      _id: new ObjectId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An unexpected error occurred during registration" }, { status: 500 });
  }
}
