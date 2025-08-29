import { ArrowRightIcon, MagnifyingGlassIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="text-2xl font-bold text-white">
          Mini Perplexity
        </div>
        <Link
          href="/login"
          className="rounded-lg border border-purple-400 px-4 py-2 text-sm text-purple-300 hover:bg-purple-400 hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-20 text-center lg:py-32">
        
        {/* Main Headline */}
        <div className="mb-8 max-w-4xl">
          <h1 className="mb-6 text-5xl font-extrabold text-white lg:text-7xl">
            AI-Powered
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Search</span>
          </h1>
          <p className="text-xl text-gray-300 lg:text-2xl">
            Get instant answers with sources. Built for developers, researchers, and curious minds.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-lg bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-purple-500 transition-all hover:scale-105"
          >
            <span>Get Started</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <button className="rounded-lg border border-gray-600 px-8 py-4 text-lg font-semibold text-gray-300 hover:bg-gray-800 transition-colors">
            View Demo
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl">
          
          {/* Feature 1 */}
          <div className="rounded-xl bg-gray-800/50 p-8 backdrop-blur-sm border border-gray-700">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
              <MagnifyingGlassIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">Smart Search</h3>
            <p className="text-gray-400">
              Advanced web scraping with real-time results from multiple sources
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-xl bg-gray-800/50 p-8 backdrop-blur-sm border border-gray-700">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">AI Summarization</h3>
            <p className="text-gray-400">
              Get concise, accurate summaries powered by advanced language models
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-xl bg-gray-800/50 p-8 backdrop-blur-sm border border-gray-700">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <BoltIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">Lightning Fast</h3>
            <p className="text-gray-400">
              Built with Next.js and optimized for speed with streaming responses
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-800 px-6 py-8 text-center">
        <p className="text-gray-400">
          Built with Next.js, Tailwind CSS & OpenAI • Open Source
        </p>
      </footer>

    </div>
  );
}
