'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Automatically sign in the user after successful registration
        const signInRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.ok) {
          router.push('/');
        } else {
          setError('Registration successful, but failed to sign in.');
        }
      } else {
        const data = await res.json();
        setError(data.message || 'An error occurred during registration');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden m-4">
        {/* Left side with the form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-white">
           <div className="md:hidden text-center mb-6">
             <h1 className="text-3xl font-bold text-blue-900">Create an Account</h1>
          </div>
          <h2 className="text-3xl font-bold text-blue-900 mb-8 hidden md:block">Register</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                Full Name
              </label>
              <input
                className="appearance-none border-0 border-b-2 border-gray-300 w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                id="fullName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
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
                Password
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
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="appearance-none border-0 border-b-2 border-gray-300 w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col items-center justify-between mt-10">
              <button
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              <p className="text-center mt-8 text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign In
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Right side with welcome message and background image */}
        <div
          className="w-full md:w-1/2 bg-cover bg-center p-12 flex-col justify-center items-start relative hidden md:flex"
          style={{ backgroundImage: "url('/register-background.jpg')" }}
        >
          <div className="absolute inset-0 bg-white opacity-60"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold text-blue-900">Hello,</h1>
            <h1 className="text-5xl font-bold text-blue-900 mb-4">Welcome to LISN</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
