
/**
 * @fileOverview Authentication
 *
 * This file contains the authentication logic for the application.
 * We will use Google Authentication for this application.
 */

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from '@/lib/db';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    'Please define the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables inside .env.local'
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;

        const user = await db.users.findOne({ id: token.sub });

        if (!user) {
          await db.users.create({
            id: token.sub,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          });
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});
