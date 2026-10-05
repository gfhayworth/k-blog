import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="w-full max-w-3xl mx-auto px-6 pt-12 pb-8 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center space-x-3">
        <Link href="/" className="font-semibold tracking-tight text-lg hover:opacity-80 transition-opacity">
          katabolab<span className="text-neutral-400 font-normal"> / blog</span>
        </Link>
      </div>

      <nav className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
          posts
        </Link>
        <a
          href="https://katabolab.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          main
        </a>
        <a
          href="/feed.xml"
          className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          title="RSS Feed"
        >
          rss
        </a>
        <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
        <ThemeToggle />
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="w-full max-w-3xl mx-auto px-6 py-12 mt-auto border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        © {new Date().getFullYear()} katabolab. Built with Next.js & Neon.
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/admin" className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
          admin
        </Link>
        <span>•</span>
        <a href="https://github.com/gfhay" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
          github
        </a>
      </div>
    </footer>
  );
}
