"use client";

import Link from 'next/link';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "@/app/ui/button";
import { useActionState } from "react";
import { authenticate } from "@/app/lib/actions";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4 sm:space-y-6">
      
      {/* Form Header - Mobile optimized */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2">Sign In</h2>
        <p className="text-gray-400 text-xs sm:text-sm">Enter your credentials to continue</p>
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
            placeholder="Enter your password"
            required
            minLength={6}
          />
          <KeyIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
      </div>

      {/* Remember Me & Forgot Password - Mobile stack */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-xs sm:text-sm">
        <label className="flex items-center text-gray-300">
          <input 
            type="checkbox" 
            className="mr-2 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-1" 
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 font-medium">
          Forgot password?
        </Link>
      </div>

      {/* Hidden Redirect Input */}
      <input type="hidden" name="redirectTo" value={callbackUrl} />

      {/* Submit Button - Mobile optimized */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 sm:py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px]"
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </>
        )}
      </button>

      {/* Error Message - Mobile friendly */}
      {errorMessage && (
        <div className="flex items-start gap-2 sm:items-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <ExclamationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Sign Up Link */}
      <div className="text-center pt-3 sm:pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs sm:text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
            Create one here
          </Link>
        </p>
      </div>

      {/* Social Login Options - Mobile stack */}
      <div className="pt-3 sm:pt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="bg-gray-800 px-3 sm:px-4 text-gray-400">Or continue with</span>
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
