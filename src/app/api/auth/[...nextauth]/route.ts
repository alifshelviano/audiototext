
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {label: 'Email', type: 'text'},
        password: {label: 'Password', type: 'password'},
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db('meetings');
        const users = db.collection('users');

        if (!credentials) {
          return null;
        }

        const user = await users.findOne({email: credentials.email});

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return {id: user._id.toString(), name: user.name, email: user.email};
        } else {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};
