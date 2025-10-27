'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { UserSession } from '@/models/User';

interface AuthContextType {
  user: UserSession | null;
  login: (provider?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    if (session?.user) {
      const userSession: UserSession = {
        userId: session.user.id!,
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.image || '',
      };
      setUser(userSession);
    } else {
      setUser(null);
    }
  }, [session]);

  const login = (provider?: string) => {
    if (provider === 'google') {
      signIn('google', { callbackUrl: '/' });
    } else {
      signIn(undefined, { callbackUrl: '/' });
    }
  };

  const logout = async () => {
    try {
      // Clear the user state first
      setUser(null);
      // Then sign out
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect to login page if there's an error
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading: status === 'loading' 
    }}>
      {children}
    </AuthContext.Provider>
  );
}