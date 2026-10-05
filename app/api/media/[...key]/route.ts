import { NextRequest, NextResponse } from 'next/server';
import { getBlogImage } from '@/lib/r2';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await context.params;
    const objectKey = key.join('/');

    // Security check: only allow blog/ prefix or image files
    if (!objectKey.startsWith('blog/')) {
      return new NextResponse('Unauthorized access to media key', { status: 403 });
    }

    const response = await getBlogImage(objectKey);
    if (!response.Body) {
      return new NextResponse('Media Not Found', { status: 404 });
    }

    const byteArray = await response.Body.transformToByteArray();
    const contentType = response.ContentType || 'application/octet-stream';

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return new NextResponse('Media Not Found', { status: 404 });
    }
    console.error('Error fetching media:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
