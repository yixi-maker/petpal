// Checks if admin account exists; creates default only in dev
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function ensureAdmin() {
  const existing = await prisma.adminUser.findFirst();
  if (existing) return;

  if (process.env.NODE_ENV === 'production') {
    const username = process.env.ADMIN_USERNAME;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!username || !passwordHash) {
      throw new Error('Production requires ADMIN_USERNAME and ADMIN_PASSWORD_HASH env vars');
    }
    await prisma.adminUser.create({ data: { username, passwordHash } });
    return;
  }

  // Dev: create admin/admin123
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.create({ data: { username: 'admin', passwordHash: hash } });
}
