import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blog.katabolab.com';

  const publishedPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(50);

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>katabolab blog</title>
  <link>${baseUrl}</link>
  <description>Thoughts, technical essays, and logs from katabolab.</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
  ${publishedPosts
    .map(
      (post) => `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${baseUrl}/${post.slug}</link>
    <guid isPermaLink="true">${baseUrl}/${post.slug}</guid>
    <description><![CDATA[${post.summary || ''}]]></description>
    <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date(post.createdAt).toUTCString()}</pubDate>
  </item>`
    )
    .join('')}
</channel>
</rss>`;

  return new NextResponse(rssFeed, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
