import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import Link from 'next/link';

interface SignInPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error } = await searchParams;

  async function handleSignIn(formData: FormData) {
    'use server';
    const email = formData.get('email') as string;
    try {
      await signIn('resend', {
        email,
        redirectTo: '/admin',
      });
    } catch (err) {
      if (err instanceof AuthError) {
        throw err;
      }
      // re-throw redirects
      throw err;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg p-6 shadow-xs">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xs font-mono text-neutral-400 hover:underline">
            ← back to blog
          </Link>
          <h1 className="text-xl font-semibold tracking-tight mt-3">Author Sign In</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Access restricted strictly to authorized katabolab administrators.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 text-center">
            {error === 'AccessDenied'
              ? 'Access denied. Your email is not authorized.'
              : 'Authentication error. Please try again.'}
          </div>
        )}

        <form action={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Admin Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@katabolab.com"
              className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 transition-colors cursor-pointer"
          >
            Send Magic Link
          </button>
        </form>
      </div>
    </div>
  );
}
