import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.STORAGE_ENDPOINT &&
      process.env.STORAGE_ACCESS_KEY_ID &&
      process.env.STORAGE_SECRET_ACCESS_KEY &&
      process.env.STORAGE_BUCKET_NAME
  );
}

function getClient(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: process.env.STORAGE_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Upload file (Buffer) ke Cloudflare R2 / S3-compatible storage.
 * Mengembalikan URL publik file.
 */
export async function uploadToStorage(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const baseUrl = (process.env.STORAGE_PUBLIC_URL || "").replace(/\/$/, "");
  if (baseUrl) {
    return `${baseUrl}/${key}`;
  }
  // Fallback: gunakan endpoint publik R2
  return `${process.env.STORAGE_ENDPOINT!.replace(/\/$/, "")}/${process.env.STORAGE_BUCKET_NAME}/${key}`;
}
