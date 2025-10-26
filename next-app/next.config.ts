import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading images from Discord CDN (used for guild icons)
  images: {
    domains: ["cdn.discordapp.com"],
    // alternatively, use remotePatterns for more fine-grained control:
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'cdn.discordapp.com', pathname: '/icons/**' }
    // ]
  },
};

export default nextConfig;
