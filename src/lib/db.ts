
/**
 * @fileOverview Database connection
 *
 * This file contains the database connection logic.
 * We will use MongoDB for this application.
 */

import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '@/config';

// TypeScript needs to know about the global `_mongoClientPromise` property.
// We use a `var` to declare a global variable that can be reassigned.
declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

async function getDb() {
  const client = await clientPromise;
  // We are slicing off the end of the MONGODB_URI to get the database name
  // This is a bit of a hack, but it works for now.
  const dbName = MONGODB_URI.slice(MONGODB_URI.lastIndexOf('/') + 1);
  return client.db(dbName);
}

// Define types for the database operations to avoid the circular reference error.
interface MeetingData {
  meetingId: string;
  password?: string;
  userId: string;
}

// The meeting object returned from our db methods will have a string _id.
interface Meeting extends MeetingData {
  _id: string;
}

interface UserData {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// The user object returned from our db methods will have a string _id.
interface User extends UserData {
  _id: string;
}

interface DbType {
  meetings: {
    create: (data: MeetingData) => Promise<Meeting>;
    findOne: (query: { meetingId: string }) => Promise<Meeting | null>;
  };
  users: {
    create: (data: UserData) => Promise<User>;
    findOne: (query: { id: string }) => Promise<User | null>;
  };
}

export const db: DbType = {
  meetings: {
    create: async (data) => {
      console.log('Creating meeting in db', data);
      const db = await getDb();
      const result = await db.collection('meetings').insertOne(data);
      console.log('Meeting created in db', result);
      // The `_id` field from MongoDB is an ObjectId, which is not directly serializable
      // in Next.js Server Actions. We convert it to a string.
      return { ...data, _id: result.insertedId.toString() };
    },
    findOne: async (query) => {
      console.log('Finding meeting in db', query);
      const db = await getDb();
      const result = await db.collection('meetings').findOne(query);
      console.log('Found meeting in db', result);
      if (result) {
        // The `_id` field from MongoDB is an ObjectId, which is not directly serializable
        // in Next.js Server Actions. We convert it to a string.
        return { ...result, _id: result._id.toString() } as unknown as Meeting;
      }
      return null;
    },
  },
  users: {
    create: async (data) => {
      console.log('Creating user in db', data);
      const db = await getDb();
      const result = await db.collection('users').insertOne(data);
      console.log('User created in db', result);
      return { ...data, _id: result.insertedId.toString() };
    },
    findOne: async (query) => {
      console.log('Finding user in db', query);
      const db = await getDb();
      const result = await db.collection('users').findOne(query);
      console.log('Found user in db', result);
      if (result) {
        return { ...result, _id: result._id.toString() } as unknown as User;
      }
      return null;
    },
  },
};
