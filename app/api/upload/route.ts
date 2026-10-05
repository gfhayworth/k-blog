import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadBlogImage } from '@/lib/r2';
import crypto from 'crypto';

export const runtime = 'nodejs';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WEBP, GIF, SVG` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'png';
    const datePrefix = new Date().toISOString().slice(0, 7); // e.g. 2026-10
    const randomHash = crypto.randomBytes(8).toString('hex');
    const safeBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const key = `blog/${datePrefix}/${safeBaseName}-${randomHash}.${ext}`;

    const url = await uploadBlogImage(key, buffer, file.type);

    return NextResponse.json({
      url,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
