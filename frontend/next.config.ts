import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Ensuring stable dev performance and ignoring potential loop triggers
  reactStrictMode: true,
};

export default nextConfig;
