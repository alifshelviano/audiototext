// models/User.ts
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  userId: string; // Changed from ObjectId to string
  name: string;
  email: string;
  avatar?: string;
}