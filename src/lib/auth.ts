import clientPromise from '@/lib/mongodb';
import {MongoDBAdapter} from '@auth/mongodb-adapter';
import {NextAuthOptions} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import {Adapter} from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
};
