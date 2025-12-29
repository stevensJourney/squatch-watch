import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true
  }
};

export default nextConfig;
