import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["gray-matter"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
