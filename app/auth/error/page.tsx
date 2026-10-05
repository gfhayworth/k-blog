import Link from 'next/link';

interface ErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-6 shadow-xs text-center">
        <h1 className="text-xl font-semibold tracking-tight text-red-600 dark:text-red-400 mb-2">
          Authentication Error
        </h1>
        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          {error === 'AccessDenied'
            ? 'Access denied. Only recognized katabolab administrator emails are allowed.'
            : error === 'Configuration'
            ? 'There is a problem with the server configuration.'
            : 'Unable to authenticate. The link may have expired or is invalid.'}
        </p>
        <Link
          href="/auth/signin"
          className="text-xs font-medium text-neutral-900 dark:text-neutral-100 underline underline-offset-4"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
