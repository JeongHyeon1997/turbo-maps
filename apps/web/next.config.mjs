// Cover URLs are built from NEXT_PUBLIC_SUPABASE_URL at runtime, so the allowed
// image host must come from the same env var — a hardcoded ref would turn any
// staging/custom-domain switch into a next/image "hostname not configured"
// render failure. Fallback keeps `next build` working without env.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : 'giilijttitajvygdosbe.supabase.co';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@maps/shared', '@maps/tokens'],
  typedRoutes: true,
  images: {
    // Supabase Storage — both the public `public-covers` bucket (next/image-eligible,
    // stable token-free URL) and the private `date-photos` bucket (signed URLs, kept
    // as plain `<img>` — see `isPublicCoverUrl`) resolve under this same host/path
    // shape, so one pattern covers both. docs/plan/12-performance.md STEP D, item 3.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        pathname: '/storage/v1/object/**',
      },
    ],
  },
};

export default nextConfig;
