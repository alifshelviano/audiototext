// import clientPromise from '@/lib/mongodb';
// import { MongoDBAdapter } from '@auth/mongodb-adapter';
// import { NextAuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import { Adapter } from 'next-auth/adapters';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcryptjs';

// export async function verifyUser(email: string, password: string) {
//   if (!email || !password) {
//     return { success: false, error: 'Missing email or password' };
//   }
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const usersCollection = db.collection('users');
//     const user = await usersCollection.findOne({ email: email });
//     if (!user) {
//         return { success: false, error: 'User not found' };
//     }
//     if (!user.password) {
//         return { success: false, error: 'User signed up with a provider' };
//     }
//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//         return { success: false, error: 'Invalid password' };
//     }
//     return {
//         success: true,
//         user: {
//             id: user._id.toString(),
//             name: user.name,
//             email: user.email,
//             image: user.image,
//         }
//     };
//   } catch (error) {
//     console.error('User verification error:', error);
//     return { success: false, error: 'Internal server error' };
//   }
// }

// export const authOptions: NextAuthOptions = {
//   adapter: MongoDBAdapter(clientPromise) as Adapter,
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       profile(profile) {
//         return {
//           id: profile.sub,
//           name: profile.name,
//           email: profile.email,
//           image: profile.picture,
//         };
//       },
//     }),
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }
//         const result = await verifyUser(credentials.email, credentials.password);

//         if (result.success && result.user) {
//             return result.user;
//         }

//         return null;
//       },
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: 'jwt',
//   },
//   callbacks: {
//     async jwt({ token, user, account }) {
//       // Initial sign in
//       if (user) {
//         token.id = user.id;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id as string;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: '/login',
//   },
// };


import clientPromise from '@/lib/mongodb';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { Adapter } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export async function verifyUser(email: string, password: string) {
  if (!email || !password) {
    return { success: false, error: 'Missing email or password' };
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Use case-insensitive email search
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    if (!user.password) {
      return { success: false, error: 'Account was created with Google. Please sign in with Google.' };
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
      }
    };
  } catch (error) {
    console.error('User verification error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        
        const result = await verifyUser(credentials.email, credentials.password);

        if (result.success && result.user) {
          return result.user;
        }

        // Throw error with message for better error handling
        throw new Error(result.error || 'Authentication failed');
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign in for all providers
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in query string as ?error=
  },
  debug: process.env.NODE_ENV === 'development',
};