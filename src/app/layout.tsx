import type { Metadata, Viewport } from 'next';
import './globals.css';
import { MobileShell } from '@/components/layout/MobileShell';
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <MobileShell>{children}</MobileShell>
        </Providers>
      </body>
    </html>
  );
}
