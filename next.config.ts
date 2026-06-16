import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images directly from source (Supabase storage) instead of through
    // Vercel's image optimizer, which has hit its usage limit (402 on new images).
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.deliveryhero.io',
      },
    ],
  },
};

export default nextConfig;
