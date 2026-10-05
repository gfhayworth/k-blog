import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PostEditor } from '@/components/post-editor';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

  if (!post) {
    notFound();
  }

  return <PostEditor post={post} />;
}
