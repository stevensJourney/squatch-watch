import type { NextConfig } from 'next';

// Set NEXT_PUBLIC_GITHUB_PAGES_BASE_PATH to your repo name when deploying to GitHub Pages
const basePath = process.env.NEXT_PUBLIC_GITHUB_PAGES_BASE_PATH || '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
