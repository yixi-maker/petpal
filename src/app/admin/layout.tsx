import type { Metadata } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const metadata: Metadata = {
  title: 'PetPal 管理后台',
  description: 'PetPal 管理员控制台',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
