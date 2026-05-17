'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">?</span>
          </div>
          <span className="font-bold text-gray-900">ExamGhost</span>
        </Link>

        {/* Center navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') && pathname === '/'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Home
          </Link>
          <Link
            href="/history"
            className={`text-sm font-medium transition-colors ${
              isActive('/history')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History
          </Link>
          <Link
            href="/analytics"
            className={`text-sm font-medium transition-colors ${
              isActive('/analytics')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </Link>
        </div>


      </div>
    </nav>
  );
}
