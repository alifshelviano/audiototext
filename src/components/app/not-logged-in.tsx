import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

export function NotLoggedIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">You are not logged in</h1>
      <p className="text-lg mb-8">Please sign in to continue</p>
      <Button onClick={() => signIn('google')}>Sign in with Google</Button>
    </div>
  );
}
