import {NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const {name, email, password} = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        {message: 'Name, email, and password are required'},
        {status: 400}
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({email});
    if (existingUser) {
      return NextResponse.json({message: 'User already exists'}, {status: 409});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      _id: new ObjectId(),
      name,
      email,
      password: hashedPassword,
  
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json({message: 'User registered successfully'}, {status: 201});
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {message: 'An unexpected error occurred'},
      {status: 500}
    );
  }
}
