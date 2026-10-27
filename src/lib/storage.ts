import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

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

/**
 * Turunkan key objek dari URL publik storage (mis. `https://pub-xxx.r2.dev/a.pdf`
 * → `a.pdf`). Mengembalikan `null` kalau URL bukan milik bucket ini.
 */
export function storageKeyFromPublicUrl(url: string): string | null {
  if (!/^https?:\/\//i.test(url)) return null;

  const bases: string[] = [];
  const publicBase = (process.env.STORAGE_PUBLIC_URL || "").replace(/\/+$/, "");
  if (publicBase) bases.push(publicBase);
  if (process.env.STORAGE_ENDPOINT && process.env.STORAGE_BUCKET_NAME) {
    bases.push(
      `${process.env.STORAGE_ENDPOINT.replace(/\/+$/, "")}/${process.env.STORAGE_BUCKET_NAME}`
    );
  }

  for (const base of bases) {
    if (url.startsWith(`${base}/`)) {
      let key = url.slice(base.length + 1).split("?")[0].split("#")[0];
      try {
        key = decodeURIComponent(key);
      } catch {
        /* biarkan apa adanya */
      }
      return key || null;
    }
  }
  return null;
}

export interface StorageObject {
  /** Body sebagai Web ReadableStream (siap dipakai `new Response(...)`). */
  body: ReadableStream<Uint8Array> | null;
  contentType?: string;
  contentLength?: number;
  contentRange?: string;
  etag?: string;
  lastModified?: Date;
}

/**
 * Ambil objek dari R2/S3 lewat **S3 API** (host yang sama dengan upload),
 * bukan lewat domain publik `*.r2.dev`.
 *
 * Dipakai saat menyajikan file ke pengunjung: sebagian ISP Indonesia memblokir
 * DNS `r2.dev`, sedangkan endpoint S3 (`*.r2.cloudflarestorage.com`) normal.
 */
export async function getObjectFromStorage(
  key: string,
  range?: string
): Promise<StorageObject> {
  const client = getClient();
  const res = await client.send(
    new GetObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME!,
      Key: key,
      Range: range,
    })
  );

  const rawBody = res.Body as { transformToWebStream?: () => ReadableStream<Uint8Array> } | undefined;
  return {
    body: rawBody?.transformToWebStream ? rawBody.transformToWebStream() : null,
    contentType: res.ContentType,
    contentLength: res.ContentLength,
    contentRange: res.ContentRange,
    etag: res.ETag,
    lastModified: res.LastModified,
  };
}
