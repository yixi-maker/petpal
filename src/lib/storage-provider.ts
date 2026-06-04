/**
 * Storage provider interface – abstracts file upload / delete so the
 * application code does not need to know whether files live on the local
 * filesystem or in cloud object storage (e.g. Tencent COS, Alibaba OSS, S3).
 */

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
      // File may already be gone – not an error worth throwing
      console.warn(`[Storage] Could not delete ${filePath}:`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// Cloud Object Storage provider (production placeholder)
// ---------------------------------------------------------------------------

class CosStorageProvider implements StorageProvider {
  async upload(file: File): Promise<{ url: string }> {
    const endpoint = process.env.STORAGE_ENDPOINT;
    const bucket = process.env.STORAGE_BUCKET;
    if (!endpoint || !bucket) {
      throw new Error('STORAGE_ENDPOINT and STORAGE_BUCKET must be set in production');
    }

    // TODO: Integrate with Tencent COS / Alibaba OSS / S3-compatible SDK.
    // Example pseudo-flow:
    //   1. Generate unique key (e.g. uploads/YYYY/MM/DD/uuid.ext)
    //   2. Call cloud SDK putObject()
    //   3. Return the public CDN URL
    const ext = sanitizeExt(file.name);
    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    console.log(`[PROD Storage] Would upload to ${endpoint}/${bucket}/${key}`);
    return { url: `https://${endpoint}/${bucket}/${key}` };
  }

  async delete(url: string): Promise<void> {
    // TODO: Parse key from CDN URL and call cloud SDK deleteObject()
    console.log(`[PROD Storage] Would delete ${url}`);
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER;
  if (provider === 'cos' || provider === 'oss' || provider === 's3' || provider === 'production') {
    return new CosStorageProvider();
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
