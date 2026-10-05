import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { format } from 'date-fns';
import { Plus, ExternalLink, LogOut } from 'lucide-react';
import { deletePost } from '@/lib/actions';

export default async function AdminDashboardPage() {
  const session = await auth();

  const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="font-semibold text-sm">
              katabolab <span className="text-neutral-400 font-normal">/ admin</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-neutral-500 font-mono hidden sm:inline">
              {session?.user?.email}
            </span>
            <Link
              href="/"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1"
            >
              view blog <ExternalLink size={12} />
            </Link>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button
                type="submit"
                className="text-neutral-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                title="Sign out"
              >
                <LogOut size={13} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Posts</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Manage, draft, and publish your essays and notes.
            </p>
          </div>
          <Link
            href="/admin/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> New Post
          </Link>
        </div>

        {allPosts.length === 0 ? (
          <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-12 text-center">
            <p className="text-sm text-neutral-500 mb-4">No posts found yet.</p>
            <Link
              href="/admin/new"
              className="text-xs font-medium text-neutral-900 dark:text-neutral-100 underline underline-offset-4"
            >
              Write your first post →
            </Link>
          </div>
        ) : (
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs font-medium text-neutral-500 font-mono">
                <tr>
                  <th className="px-5 py-3 font-normal">Title</th>
                  <th className="px-5 py-3 font-normal">Status</th>
                  <th className="px-5 py-3 font-normal hidden sm:table-cell">Date</th>
                  <th className="px-5 py-3 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {allPosts.map((post) => {
                  const dateStr = post.publishedAt
                    ? format(new Date(post.publishedAt), 'MMM dd, yyyy')
                    : format(new Date(post.createdAt), 'MMM dd, yyyy');

                  return (
                    <tr key={post.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/${post.id}/edit`}
                          className="font-medium hover:underline underline-offset-2"
                        >
                          {post.title}
                        </Link>
                        <div className="text-xs font-mono text-neutral-400 mt-0.5">
                          /{post.slug}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-full font-mono ${
                            post.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono text-neutral-400 hidden sm:table-cell">
                        {dateStr}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-3 text-xs">
                        <Link
                          href={`/admin/${post.id}/edit`}
                          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                        >
                          Edit
                        </Link>
                        {post.status === 'published' && (
                          <Link
                            href={`/${post.slug}`}
                            target="_blank"
                            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                          >
                            View
                          </Link>
                        )}
                        <form
                          action={async () => {
                            'use server';
                            await deletePost(post.id);
                          }}
                          className="inline-block"
                        >
                          <button
                            type="submit"
                            className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
