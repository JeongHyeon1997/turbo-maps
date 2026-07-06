import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://maps.weourus.xyz'),
  title: {
    default: 'We Log',
    template: '%s · We Log',
  },
  description: '커플이 함께한 데이트·맛집·경로를 기록하는 공간, We Log.',
  applicationName: 'We Log',
  openGraph: {
    type: 'website',
    siteName: 'We Log',
    title: 'We Log',
    description: '커플이 함께한 데이트·맛집·경로를 기록하는 공간, We Log.',
    locale: 'ko_KR',
    url: 'https://maps.weourus.xyz',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans text-text-primary bg-white antialiased">{children}</body>
    </html>
  );
}
