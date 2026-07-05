import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'maps',
  description: '커플이 함께한 데이트·맛집·경로를 기록하는 공간',
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
