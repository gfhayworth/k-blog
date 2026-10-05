import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME || 'katabolab-kmail-storage';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export async function uploadBlogImage(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const fullKey = key.startsWith('blog/') ? key : `blog/${key}`;
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: fullKey,
    ContentType: contentType,
  });

  await r2.send(command);

  // If R2_PUBLIC_URL is configured (and not empty / localhost proxy), use it, otherwise use our proxy route /api/media/[...key]
  if (R2_PUBLIC_URL && !R2_PUBLIC_URL.includes('media.katabolab.com')) {
    return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${fullKey}`;
  }

  // Provide seamless proxy URL through the blog application itself
  return `/api/media/${fullKey}`;
}

export async function getBlogImage(key: string) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  return r2.send(command);
}
