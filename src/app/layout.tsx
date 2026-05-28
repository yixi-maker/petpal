import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: 'PetPal - 毛孩子的社交乐园',
  description: '面向猫狗主人的宠物社交与本地生活应用',
  applicationName: 'PetPal',
  appleWebApp: {
    capable: true,
    title: 'PetPal',
    statusBarStyle: 'default',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f97316',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        {/* SW disabled for V1 stability */}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
