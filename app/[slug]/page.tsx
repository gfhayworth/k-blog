import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Header, Footer } from '@/components/header';
import { renderMarkdown, estimateReadingTime } from '@/lib/markdown';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);

  if (!post || post.status !== 'published') {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.summary || post.title,
    openGraph: {
      title: post.title,
      description: post.summary || post.title,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);

  if (!post || post.status !== 'published') {
    notFound();
  }

  const htmlContent = await renderMarkdown(post.content);
  const readingTime = estimateReadingTime(post.content);
  const dateStr = post.publishedAt
    ? format(new Date(post.publishedAt), 'MMMM dd, yyyy')
    : '';

  return (
    <>
      <Header />
      <main className="w-full max-w-3xl mx-auto px-6 py-12 flex-1">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-6 group"
          >
            <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-0.5 transition-transform" />
            back to posts
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            {post.title}
          </h1>
          <div className="flex items-center space-x-3 text-xs font-mono text-neutral-400">
            <time>{dateStr}</time>
            <span>•</span>
            <span>{readingTime}</span>
          </div>
        </div>

        {post.coverImageUrl && (
          <div className="mb-10 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full object-cover max-h-[400px]"
            />
          </div>
        )}

        <article
          className="prose dark:prose-invert prose-neutral max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-neutral-900 dark:prose-a:text-neutral-100 prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </main>
      <Footer />
    </>
  );
}
