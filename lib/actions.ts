'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const title = (formData.get('title') as string) || '';
  let slug = (formData.get('slug') as string) || '';
  const summary = (formData.get('summary') as string) || '';
  const content = (formData.get('content') as string) || '';
  const coverImageUrl = (formData.get('coverImageUrl') as string) || null;
  const status = (formData.get('status') as 'draft' | 'published') || 'draft';

  if (!title.trim()) {
    throw new Error('Title is required');
  }

  if (!slug.trim()) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  const publishedAt = status === 'published' ? new Date() : null;

  await db
    .insert(posts)
    .values({
      title,
      slug,
      summary,
      content,
      coverImageUrl,
      status,
      publishedAt,
      updatedAt: new Date(),
    });

  revalidatePath('/');
  revalidatePath('/feed.xml');
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin');

  redirect('/admin');
}

export async function updatePost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  const title = (formData.get('title') as string) || '';
  let slug = (formData.get('slug') as string) || '';
  const summary = (formData.get('summary') as string) || '';
  const content = (formData.get('content') as string) || '';
  const coverImageUrl = (formData.get('coverImageUrl') as string) || null;
  const status = (formData.get('status') as 'draft' | 'published') || 'draft';

  if (!id) {
    throw new Error('Post ID is required');
  }

  if (!title.trim()) {
    throw new Error('Title is required');
  }

  if (!slug.trim()) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  // Get current post to see if it was already published
  const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  let publishedAt = existing?.publishedAt;
  if (status === 'published' && !publishedAt) {
    publishedAt = new Date();
  }

  await db
    .update(posts)
    .set({
      title,
      slug,
      summary,
      content,
      coverImageUrl,
      status,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));

  revalidatePath('/');
  revalidatePath(`/${slug}`);
  if (existing?.slug && existing.slug !== slug) {
    revalidatePath(`/${existing.slug}`);
  }
  revalidatePath('/feed.xml');
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin');

  redirect('/admin');
}

export async function deletePost(id: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

  await db.delete(posts).where(eq(posts.id, id));

  revalidatePath('/');
  if (existing?.slug) {
    revalidatePath(`/${existing.slug}`);
  }
  revalidatePath('/feed.xml');
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin');
}
