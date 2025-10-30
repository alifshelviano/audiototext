'use client';

import { useState } from 'react';
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
    setIsLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const signInResponse = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (signInResponse?.ok) {
          router.push('/');
        } else {
          setError('Failed to automatically log in. Please go to the login page.');
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center md:flex-row h-screen overflow-hidden">
      {/* Form side */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-4 md:p-8 lg:p-12 bg-white overflow-y-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
          <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Register</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                Full Name
              </label>
              <input
                className="shadow appearance-none border-b-2 border-gray-300 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="fullName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border-b-2 border-gray-300 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border-b-2 border-gray-300 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="shadow appearance-none border-b-2 border-gray-300 w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col items-center justify-between">
              <button
                className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              <p className="text-center mt-4">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-800">
                  Sign In
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Welcome message side (hidden on mobile) */}
      <div
        className="hidden md:flex w-full md:w-1/2 h-full bg-cover bg-center justify-center items-center p-12 text-center"
        style={{ backgroundImage: "url('/register-background.jpg')" }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-900">Hello,</h1>
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Welcome to LISN</h1>
        </div>
      </div>
    </div>
  );
}
