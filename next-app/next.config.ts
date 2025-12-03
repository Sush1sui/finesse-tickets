import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading images from Discord CDN (used for guild icons)
  images: {
    // Use remotePatterns instead of deprecated `domains` config
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
