import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon, PlusIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';

export default function SideNav() {
  return (
    <div className="flex h-full w-full flex-col bg-gray-900 border-r border-gray-700">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-700">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <span className="text-sm font-bold text-white">MP</span>
          </div>
          <span className="hidden font-semibold text-white md:block">Mini Perplexity</span>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button className="flex w-full items-center justify-center space-x-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white hover:bg-purple-500 transition-colors">
          <PlusIcon className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-1">
          <NavLinks />
        </div>
        
        {/* Recent Chats Section */}
        <div className="mt-6">
          <h3 className="mb-2 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Recent Chats
          </h3>
          <div className="space-y-1">
            {/* Example recent chats - replace with dynamic data */}
            <div className="rounded-lg px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer">
              AI in healthcare trends
            </div>
            <div className="rounded-lg px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer">
              Best React frameworks 2025
            </div>
            <div className="rounded-lg px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer">
              Machine learning basics
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="border-t border-gray-700 p-4">
        <form action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }}>
          <button className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors md:justify-start">
            <PowerIcon className="h-4 w-4" />
            <span className="hidden md:block">Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
