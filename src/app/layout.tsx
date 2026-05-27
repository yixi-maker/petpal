import type { Metadata, Viewport } from 'next';
import './globals.css';
import { MobileShell } from '@/components/layout/MobileShell';

export const metadata: Metadata = {
  title: 'PetPal - 毛孩子的社交乐园',
  description: '面向猫狗主人的宠物社交与本地生活应用',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
