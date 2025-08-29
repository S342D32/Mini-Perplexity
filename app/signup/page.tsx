import SignupForm from '@/app/ui/signup-form';
import { Suspense } from 'react';
 
export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      
      {/* Background Image Container - Mobile optimized */}
      <div className="absolute inset-0 opacity-10 sm:opacity-20">
        {/* Background patterns - lighter on mobile for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 sm:from-purple-500/10 sm:to-pink-500/10"></div>
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content - Mobile first approach */}
      <main className="relative flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-sm sm:max-w-md">
          
          {/* Logo/Brand Section - Smaller on mobile */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl">
              <span className="text-lg sm:text-2xl font-bold text-white">MP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join Mini Perplexity</h1>
            <p className="text-sm sm:text-base text-gray-400">Create your account and start exploring</p>
          </div>

          {/* Signup Form Container - Responsive padding */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8">
            <Suspense fallback={
              <div className="text-center text-white py-8">
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm">Loading...</p>
              </div>
            }>
              <SignupForm />
            </Suspense>
          </div>

          {/* Footer Links - Mobile friendly */}
          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-purple-400 hover:text-purple-300 font-medium">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-purple-400 hover:text-purple-300 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
