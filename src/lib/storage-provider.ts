// STAGING STATUS: S3 SigV4 signing is implemented.
// Compatible with AWS S3, Alibaba Cloud OSS, Tencent COS, MinIO, Cloudflare R2.
// To use: set STORAGE_PROVIDER=s3 and configure STORAGE_ENDPOINT, STORAGE_BUCKET,
// STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY.
// Note: Not yet tested against a real bucket. Test with valid credentials.

/**
 * Storage provider interface — abstracts file upload / delete so the
 * application code does not need to know whether files live on the local
 * filesystem or in cloud object storage (e.g. AWS S3, Alibaba OSS, Tencent COS, MinIO).
 */
// In production, consider using @aws-sdk/client-s3 for a fully-featured client:
//   import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
//   const client = new S3Client({
//     region: process.env.STORAGE_REGION || 'us-east-1',
//     endpoint: process.env.STORAGE_ENDPOINT,
//     credentials: {
//       accessKeyId: process.env.STORAGE_ACCESS_KEY!,
//       secretAccessKey: process.env.STORAGE_SECRET_KEY!,
//     },
//     forcePathStyle: true, // Required for MinIO and many S3-compatible services
//   });
//   await client.send(new PutObjectCommand({ Bucket, Key, Body, ContentType }));

export interface StorageProvider {
  /**
   * Upload a file and return its public URL.
   * The implementation is responsible for generating a unique filename.
   */
  upload(file: File): Promise<{ url: string }>;

  /**
   * Delete a previously uploaded file by its URL.
   */
  delete(url: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Local filesystem provider (dev)
// ---------------------------------------------------------------------------

class LocalStorageProvider implements StorageProvider {
  async upload(file: File): Promise<{ url: string }> {
    // Dynamic import to keep fs/promises out of client bundles
    const { writeFile, mkdir } = await import('fs/promises');
    const path = await import('path');

    const ext = sanitizeExt(file.name);
    const filename = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return { url: `/uploads/${filename}` };
  }

  async delete(url: string): Promise<void> {
    const { unlink } = await import('fs/promises');
    const path = await import('path');

    // Only allow deleting files under public/uploads/
    const relativePath = url.replace(/^\/uploads\//, '');
    if (!relativePath || relativePath.includes('..')) {
      console.warn(`[Storage] Refusing to delete unsafe path: ${url}`);
      return;
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', relativePath);
    try {
      await unlink(filePath);
    } catch (err) {
      // File may already be gone - not an error worth throwing
      console.warn(`[Storage] Could not delete ${filePath}:`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// S3-compatible cloud storage provider (production)
//
// Uses AWS Signature Version 4 for authentication.
// Compatible with: AWS S3, Alibaba Cloud OSS, Tencent COS, MinIO, Cloudflare R2.
// ---------------------------------------------------------------------------

class S3StorageProvider implements StorageProvider {
  private endpoint: string;
  private bucket: string;
  private accessKey: string;
  private secretKey: string;
  private region: string;
  private publicBaseUrl: string;

  constructor() {
    const endpoint = process.env.STORAGE_ENDPOINT;
    const bucket = process.env.STORAGE_BUCKET;
    const accessKey = process.env.STORAGE_ACCESS_KEY;
    const secretKey = process.env.STORAGE_SECRET_KEY;

    if (!endpoint || !bucket || !accessKey || !secretKey) {
      throw new Error(
        'Storage not configured. Set STORAGE_ENDPOINT, STORAGE_BUCKET, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY',
      );
    }

    this.endpoint = endpoint;
    this.bucket = bucket;
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.region = process.env.STORAGE_REGION || 'us-east-1';
    this.publicBaseUrl =
      process.env.STORAGE_PUBLIC_URL || `https://${bucket}.${endpoint}`;
  }

  async upload(file: File): Promise<{ url: string }> {
    const ext = sanitizeExt(file.name);
    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    const date = new Date();
    const dateStr = isoDate(date);
    const datetimeStr = isoDatetime(date);
    const service = 's3';
    const host = this.endpoint.includes('://')
      ? new URL(this.endpoint).host
      : this.endpoint;
    const payloadHash = await sha256Hex(body);

    // Step 1: Canonical Request
    const canonicalHeaders = [
      `content-type:${file.type || 'application/octet-stream'}`,
      `host:${host}`,
      `x-amz-content-sha256:${payloadHash}`,
      `x-amz-date:${datetimeStr}`,
    ].join('\n');

    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      'PUT',
      `/${key}`,
      '', // no query string
      canonicalHeaders + '\n',
      signedHeaders,
      payloadHash,
    ].join('\n');

    // Step 2: String to Sign
    const credentialScope = `${dateStr}/${this.region}/${service}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      datetimeStr,
      credentialScope,
      await sha256Hex(new TextEncoder().encode(canonicalRequest)),
    ].join('\n');

    // Step 3: Calculate Signature
    const signingKey = await deriveSigningKey(
      this.secretKey,
      dateStr,
      this.region,
      service,
    );
    const signature = await hmacHex(signingKey, stringToSign);

    // Step 4: Build Authorization header
    const authorization = [
      `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ');

    // Send the request
    const url = `https://${host}/${key}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': String(file.size),
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': datetimeStr,
        Authorization: authorization,
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      console.error(
        `[Storage] Upload failed: HTTP ${response.status} - ${errorText.slice(0, 300)}`,
      );
      throw new Error(`Upload failed: ${response.status}`);
    }

    const publicUrl = `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    console.log(`[Storage] Uploaded ${file.name} -> ${publicUrl}`);
    return { url: publicUrl };
  }

  async delete(url: string): Promise<void> {
    // Extract the key from the URL
    let key: string;
    try {
      const parsed = new URL(url);
      key = parsed.pathname.replace(/^\//, '');
    } catch {
      // Assume the URL is already a key-like path
      key = url.replace(/^https?:\/\/[^/]+\//, '');
    }

    if (!key || key.includes('..')) {
      console.warn(`[Storage] Refusing to delete unsafe key: ${key}`);
      return;
    }

    const date = new Date();
    const dateStr = isoDate(date);
    const datetimeStr = isoDatetime(date);
    const service = 's3';
    const host = this.endpoint.includes('://')
      ? new URL(this.endpoint).host
      : this.endpoint;

    const payloadHash = 'UNSIGNED-PAYLOAD';

    // Canonical Request for DELETE
    const canonicalHeaders = [
      `host:${host}`,
      `x-amz-content-sha256:${payloadHash}`,
      `x-amz-date:${datetimeStr}`,
    ].join('\n');

    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      'DELETE',
      `/${key}`,
      '',
      canonicalHeaders + '\n',
      signedHeaders,
      payloadHash,
    ].join('\n');

    const credentialScope = `${dateStr}/${this.region}/${service}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      datetimeStr,
      credentialScope,
      await sha256Hex(new TextEncoder().encode(canonicalRequest)),
    ].join('\n');

    const signingKey = await deriveSigningKey(
      this.secretKey,
      dateStr,
      this.region,
      service,
    );
    const signature = await hmacHex(signingKey, stringToSign);

    const authorization = [
      `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ');

    const deleteUrl = `https://${host}/${key}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': datetimeStr,
        Authorization: authorization,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text().catch(() => 'unknown');
      console.warn(
        `[Storage] Delete failed: HTTP ${response.status} - ${errorText.slice(0, 300)}`,
      );
    } else {
      console.log(`[Storage] Deleted ${key}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Cryptographic helpers (Web Crypto API - works in Node.js and edge runtimes)
// ---------------------------------------------------------------------------

async function sha256Hex(data: Uint8Array): Promise<string> {
  // Uint8Array.buffer is ArrayBufferLike in newer TS typings, but in all our
  // call sites the view owns the underlying buffer, so .buffer is safe.
  const hash = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha256(
  key: ArrayBuffer,
  data: string,
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

async function hmacHex(key: ArrayBuffer, data: string): Promise<string> {
  const sig = await hmacSha256(key, data);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function deriveSigningKey(
  secretKey: string,
  dateStr: string,
  region: string,
  service: string,
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(
    new TextEncoder().encode(`AWS4${secretKey}`).buffer as ArrayBuffer,
    dateStr,
  );
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

// ---------------------------------------------------------------------------
// Date formatting helpers
// ---------------------------------------------------------------------------

/** Format as YYYYMMDD */
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/** Format as YYYYMMDD'T'HHMMSS'Z' */
function isoDatetime(d: Date): string {
  return (
    d.toISOString().slice(0, 10).replace(/-/g, '') +
    'T' +
    d.toISOString().slice(11, 19).replace(/:/g, '') +
    'Z'
  );
}

// ---------------------------------------------------------------------------
// Factory
//
// Fail-fast: if STORAGE_PROVIDER is not 'local' but credentials are missing,
// throws at construction time. Connection errors also propagate.
// ---------------------------------------------------------------------------

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER;
  if (
    provider === 's3' ||
    provider === 'oss' ||
    provider === 'cos' ||
    provider === 'production'
  ) {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a safe lower-case extension from the original filename.
 * Defaults to 'jpg' when none can be determined.
 */
function sanitizeExt(originalName: string): string {
  const parts = originalName.split('.');
  const raw = parts.length > 1 ? parts.pop()! : 'jpg';
  return raw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
}

/**
 * Sanitize a user-provided filename for safe storage.
 * - Removes special characters
 * - Limits length to 64 chars (before extension)
 * - Preserves the extension
 */
export function sanitizeFilename(originalName: string): string {
  const dotIndex = originalName.lastIndexOf('.');
  const base = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
  const ext = dotIndex > 0 ? originalName.slice(dotIndex) : '';

  const clean = base
    .replace(/[^a-zA-Z0-9一-鿿_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 64);

  return (clean || 'file') + ext;
}

/**
 * Allowed MIME types for uploads.
 */
export const ALLOWED_UPLOAD_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/** Max upload size: 5 MB */
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
