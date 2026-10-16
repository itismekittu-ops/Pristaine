import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
    experimental: {
    staticGenerationRetryCount: 3,
  },
  async redirects() {
    return [
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/cookie-policy', destination: '/privacy#cookies', permanent: true },
    ];
  },
};

export default nextConfig;
