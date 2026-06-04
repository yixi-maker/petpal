import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
  getStorageProvider,
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_SIZE,
  sanitizeFilename,
} from '@/lib/storage-provider';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // Validate file type
    if (!(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，请上传 JPG/PNG/WebP 图片' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: '文件大小不能超过 5MB' },
        { status: 400 }
      );
    }

    // Validate file is not empty
    if (file.size === 0) {
      return NextResponse.json({ error: '文件为空' }, { status: 400 });
    }

    // Sanitize filename before storage
    const sanitizedFilename = sanitizeFilename(file.name);
    const renamedFile = new File([file], sanitizedFilename, { type: file.type });

    // Upload via storage provider
    const storage = getStorageProvider();
    const { url } = await storage.upload(renamedFile);

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[Upload] Failed:', err);
    return NextResponse.json({ error: '上传失败，请重试' }, { status: 500 });
  }
}
