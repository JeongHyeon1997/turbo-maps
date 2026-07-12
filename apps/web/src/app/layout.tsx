import type { Metadata } from 'next';
import './globals.css';
import { jua } from './fonts';
import { SITE_URL } from '@/lib/site-url';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
} from '@/lib/og-image';

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
    // Site-wide default — the fallback for every public route that doesn't set
    // its own `openGraph.images` (landing, `/explore`, `/places`, region index,
    // and any course/place/region detail page with no cover of its own; see
    // `lib/og-image.ts`). Any nested route whose own `generateMetadata` returns
    // an `openGraph` object entirely replaces this one (Next doesn't merge
    // `openGraph` across segments), so those routes re-declare `images` too.
    images: [
      {
        url: DEFAULT_OG_IMAGE_URL,
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: DEFAULT_OG_IMAGE_ALT,
      },
    ],
  },
  // No explicit `images` here — Next auto-fills `twitter.images` from the
  // resolved `openGraph.images` above whenever a route's twitter metadata
  // doesn't declare its own `images` key.
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={jua.variable} suppressHydrationWarning>
      <head>
        {/* Pretendard (UI sans) — dynamic-subset CSS from jsDelivr, version-pinned
            (not `@latest`) so the response is CDN-cacheable and reproducible.
            `preconnect` lets the browser open the connection while the rest of
            <head> parses, instead of discovering cdn.jsdelivr.net only after
            this stylesheet request is issued. Kept as a real <link> (not a CSS
            `@import` in globals.css) so it loads in parallel with app CSS
            rather than serialized behind it (perf audit #1,
            docs/plan/12-performance.md). Dynamic-subset (glyph-slice) loading
            beats a self-hosted full variable woff2 (~2MB) for Korean text, so
            we keep the CDN chain rather than `next/font/local`. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
        {/* Runs before first paint so light→dark never flashes (08 risk #3):
            reads the stored preference and flips `.dark` ahead of hydration. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans text-text-primary bg-background antialiased">{children}</body>
    </html>
  );
}
