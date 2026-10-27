import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The client package ships TypeScript sources.
  transpilePackages: ['@zaminnegar/api-client'],
};

export default nextConfig;
