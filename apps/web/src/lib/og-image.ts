import { SITE_URL } from './site-url';

// Shared by every `generateMetadata` on a public route (`/explore/[id]`,
// `/places/[id]`, `/explore/regions/[region]`, ...) plus the root layout, so
// og:image/twitter:image resolve the exact same way everywhere: a real cover
// when the route has one, otherwise the brand default OG image — always as an
// absolute URL, which is what Kakao/Facebook/Twitter scrapers require (they
// don't reliably resolve relative paths even though `metadataBase` lets Next
// do it for browsers).

// Cover-based OG "large image" hint size — real course/place cover photos vary
// in aspect ratio, but declaring 1200x630 nudges Kakao/Facebook toward
// rendering the big-thumbnail card layout regardless of the source image's
// actual dimensions.
export const COVER_OG_IMAGE_WIDTH = 1200;
export const COVER_OG_IMAGE_HEIGHT = 630;

// Brand default OG image — a static, pre-branded PNG at `public/og-default.png`
// (not generated on request). Width/height below are the file's *actual* pixel
// size, not a hint, so strict scrapers that cross-check declared vs. real
// dimensions don't reject it.
export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/og-default.png`;
export const DEFAULT_OG_IMAGE_WIDTH = 800;
export const DEFAULT_OG_IMAGE_HEIGHT = 400;
export const DEFAULT_OG_IMAGE_ALT = '위로그';

export interface OgImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Builds an absolute-URL OG image descriptor for `openGraph.images`/`twitter.images`.
 * Pass the route's real cover URL (already absolute — see `publicCoverUrl`) when it
 * has one; pass `null`/`undefined` to fall back to the brand default OG image.
 */
export function ogImage(url: string | null | undefined, alt: string): OgImage {
  if (!url) {
    return {
      url: DEFAULT_OG_IMAGE_URL,
      width: DEFAULT_OG_IMAGE_WIDTH,
      height: DEFAULT_OG_IMAGE_HEIGHT,
      alt: DEFAULT_OG_IMAGE_ALT,
    };
  }
  return { url, width: COVER_OG_IMAGE_WIDTH, height: COVER_OG_IMAGE_HEIGHT, alt };
}
