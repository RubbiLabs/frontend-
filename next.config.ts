import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  turbopack: {},
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
