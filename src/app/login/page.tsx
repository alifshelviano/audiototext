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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden m-4">
        {/* Left side with welcome message and background image */}
        <div
          className="w-full md:w-1/2 bg-cover bg-center p-12 flex-col justify-center items-start relative hidden md:flex"
          style={{ backgroundImage: "url('/login-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-white opacity-60"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold text-blue-900">Hello,</h1>
            <h1 className="text-5xl font-bold text-blue-900 mb-4">Welcome to LISN</h1>
          </div>
        </div>

        {/* Right side with the form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-white">
          <div className="md:hidden text-center mb-6">
             <h1 className="text-3xl font-bold text-blue-900">Welcome back!</h1>
          </div>
          <h2 className="text-3xl font-bold text-blue-900 mb-8 hidden md:block">Sign In</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleCredentialsSubmit}>
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                EMAIL
              </label>
              <input
                className="appearance-none border-0 border-b-2 border-gray-300 w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                PASSWORD
              </label>
              <input
                className="appearance-none border-0 border-b-2 border-gray-300 w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col items-center justify-between mt-10">
              <button
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
              <div className="relative my-6 w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              <button
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm w-full flex items-center justify-center"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                type="button"
              >
                <FcGoogle className="mr-3" /> Sign in with Google
              </button>
              <p className="text-center mt-8 text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
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
