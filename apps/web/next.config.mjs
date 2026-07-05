/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@maps/shared', '@maps/tokens'],
  typedRoutes: true,
};

export default nextConfig;
