import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-6 shadow-xs text-center">
        <h1 className="text-xl font-semibold tracking-tight mb-2">Check your email</h1>
        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          A magic sign-in link has been sent to your email address. Click the link to log into the admin dashboard.
        </p>
        <Link
          href="/"
          className="text-xs font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          ← Return to blog
        </Link>
      </div>
    </div>
  );
}
