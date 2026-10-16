import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_API_BASE_URL:
      process.env.NEXT_API_BASE_URL ?? "http://localhost:3000",
  },
  // Proxy /api-proxy/* → backend so the browser never needs to know the
  // backend URL at all. This completely bypasses the env-var issue.
  async rewrites() {
    const backend =
      process.env.NEXT_API_BASE_URL ?? "http://localhost:3000";
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default nextConfig;
