
import {NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const {name, email, password} = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({message: 'Missing required fields'}, {status: 400});
  }

  const client = await clientPromise;
  const db = client.db('meetings');
  const users = db.collection('users');

  const existingUser = await users.findOne({email});
  if (existingUser) {
    return NextResponse.json({message: 'User already exists'}, {status: 409});
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await users.insertOne({
    name,
    email,
    password: hashedPassword,
  });

  return NextResponse.json({message: 'User created successfully'}, {status: 201});
}
