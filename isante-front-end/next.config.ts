import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  // Disable all static generation to prevent prerendering issues
  staticPageGenerationTimeout: 300,
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
  // Additional configuration to prevent static generation
  outputFileTracingRoot: undefined,
  // Disable all static optimization
  swcMinify: false,
  // Force all pages to be dynamic
  experimental: {
    // Disable static optimization
    optimizeCss: false,
    disableOptimizedLoading: true,
    // Force dynamic rendering
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
