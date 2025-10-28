'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'CredentialsSignin':
          setError('Invalid email or password');
          break;
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
          setError('Error with Google sign in. Please try again.');
          break;
        default:
          setError('An error occurred during sign in');
      }
    }
  }, [searchParams]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signIn('google', {
        callbackUrl: '/',
        redirect: true,
      });
    } catch (error) {
      console.error('Google login error:', error);
      setError('An error occurred with Google login');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex w-full max-w-4xl">
        {/* Left side with welcome message */}
        <div className="w-1/2 bg-gray-100 p-12 flex flex-col justify-center items-start">
          <h1 className="text-4xl font-bold text-blue-900">Hello,</h1>
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Welcome to LISN</h1>
        </div>

        {/* Right side with the form */}
        <div className="w-1/2 p-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-8">Sign In</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleCredentialsSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                EMAIL
              </label>
              <input
                className="shadow appearance-none border-b-2 border-gray-300 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                PASSWORD
              </label>
              <input
                className="shadow appearance-none border-b-2 border-gray-300 w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col items-center justify-between">
              <button
                className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
              <button
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-full mt-4 flex items-center justify-center"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <FcGoogle className="mr-2" /> Sign in with Google
              </button>
              <p className="text-center mt-4">
                Don't have an account?{' '}
                <a href="/register" className="text-blue-600 hover:text-blue-800">
                  Create account
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
