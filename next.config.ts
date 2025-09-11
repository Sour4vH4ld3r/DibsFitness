import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  output: 'standalone',
  eslint: {
    // Only run ESLint on dev, not on production builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // Ignore TypeScript errors during build for now
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Image domains
  images: {
    domains: [
      'localhost',
      'ylslhgrdtescqwtmpyqg.supabase.co',
      '*.excloud.com'
    ],
    unoptimized: false,
  },
  
  // External packages
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // API caching headers
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=59',
          },
        ],
      },
      // Static assets caching
      {
        source: '/(.*)\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Allow cross-origin requests in development
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      'localhost:3000',
      '192.168.1.7:3000',
      '*.local:3000',
    ],
  }),
};

export default nextConfig;
