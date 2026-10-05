import Link from 'next/link';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Header, Footer } from '@/components/header';
import { estimateReadingTime } from '@/lib/markdown';
import { format } from 'date-fns';

export const revalidate = 60; // revalidate every 60s or on-demand

export default async function HomePage() {
  const publishedPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt));

  return (
    <>
      <Header />
      <main className="w-full max-w-3xl mx-auto px-6 py-12 flex-1">
        <section className="mb-12">
          <h1 className="text-xl font-medium tracking-tight mb-2">Writing</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Notes, technical essays, and architecture logs on software systems, minimalism, and infrastructure.
          </p>
        </section>

        {publishedPosts.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-400">
            No published posts yet.
          </div>
        ) : (
          <div className="space-y-10">
            {publishedPosts.map((post) => {
              const dateStr = post.publishedAt
                ? format(new Date(post.publishedAt), 'MMM dd, yyyy')
                : '';
              const readingTime = estimateReadingTime(post.content);

              return (
                <article key={post.id} className="group flex flex-col space-y-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <Link
                      href={`/${post.slug}`}
                      className="text-base font-medium group-hover:underline underline-offset-4 tracking-tight"
                    >
                      {post.title}
                    </Link>
                    <time className="text-xs font-mono text-neutral-400 shrink-0">
                      {dateStr}
                    </time>
                  </div>
                  {post.summary && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {post.summary}
                    </p>
                  )}
                  <div className="text-xs font-mono text-neutral-400 pt-1">
                    {readingTime}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
