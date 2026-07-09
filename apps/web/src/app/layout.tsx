import type { Metadata } from 'next';
import './globals.css';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '위로그',
    template: '%s · 위로그',
  },
  description: '커플이 함께한 데이트·맛집·경로를 기록하는 공간, 위로그.',
  applicationName: '위로그',
  openGraph: {
    type: 'website',
    siteName: '위로그',
    title: '위로그',
    description: '커플이 함께한 데이트·맛집·경로를 기록하는 공간, 위로그.',
    locale: 'ko_KR',
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans text-text-primary bg-background antialiased">{children}</body>
    </html>
  );
}
