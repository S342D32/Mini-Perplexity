'use client';

import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  UserIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import Link from 'next/link';

export default function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircleIcon className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Account Created!</h2>
        <p className="text-gray-400 text-sm sm:text-base">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      
      {/* Form Header - Mobile optimized */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2">Create Account</h2>
        <p className="text-gray-400 text-xs sm:text-sm">Fill in your details to get started</p>
      </div>

      {/* Name Field - Touch friendly */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-300" htmlFor="name">
          Full Name
        </label>
        <div className="relative">
          <input
            className="w-full px-3 sm:px-4 py-3 sm:py-3 pl-10 sm:pl-12 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
            id="name"
            type="text"
            name="name"
            placeholder="Enter your full name"
            required
          />
          <UserIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
      </div>

      {/* Email Field - Touch friendly */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-300" htmlFor="email">
          Email Address
        </label>
        <div className="relative">
          <input
            className="w-full px-3 sm:px-4 py-3 sm:py-3 pl-10 sm:pl-12 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          />
          <AtSymbolIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
      </div>

      {/* Password Field - Touch friendly */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-300" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            className="w-full px-3 sm:px-4 py-3 sm:py-3 pl-10 sm:pl-12 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
            id="password"
            type="password"
            name="password"
            placeholder="Create a secure password"
            required
            minLength={6}
          />
          <KeyIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500">Must be at least 6 characters</p>
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-300" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="relative">
          <input
            className="w-full px-3 sm:px-4 py-3 sm:py-3 pl-10 sm:pl-12 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            required
            minLength={6}
          />
          <KeyIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start space-x-2 text-xs sm:text-sm">
        <input
          type="checkbox"
          id="terms"
          name="terms"
          required
          className="mt-0.5 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-1"
        />
        <label htmlFor="terms" className="text-gray-300">
          I agree to the{" "}
          <Link href="/terms" className="text-purple-400 hover:text-purple-300 font-medium">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-purple-400 hover:text-purple-300 font-medium">
            Privacy Policy
          </Link>
        </label>
      </div>

      {/* Submit Button - Mobile optimized */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 sm:py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px]"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </>
        )}
      </button>

      {/* Error Message - Mobile friendly */}
      {error && (
        <div className="flex items-start gap-2 sm:items-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <ExclamationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Login Link */}
      <div className="text-center pt-3 sm:pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs sm:text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Sign in here
          </Link>
        </p>
      </div>

      {/* Social Signup Options - Mobile stack */}
      <div className="pt-3 sm:pt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="bg-gray-800 px-3 sm:px-4 text-gray-400">Or sign up with</span>
          </div>
        </div>
        
        {/* Social buttons stack on mobile, side-by-side on desktop */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-600 rounded-lg bg-gray-900/50 text-xs sm:text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors min-h-[40px] sm:min-h-[44px]"
          >
            Google
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-600 rounded-lg bg-gray-900/50 text-xs sm:text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors min-h-[40px] sm:min-h-[44px]"
          >
            GitHub
          </button>
        </div>
      </div>
    </form>
  );
}
