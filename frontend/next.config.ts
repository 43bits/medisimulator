import type { NextConfig } from "next";

const FALLBACK = "http://localhost:3000";

function resolveBackend(): string {
  const raw = (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    ""
  )
    .trim()
    .replace(/\/$/, "");

  return /^https?:\/\//.test(raw) ? raw : FALLBACK;
}

const backend = resolveBackend();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: backend,
  },
  // Proxy /api-proxy/* -> backend so the browser never needs the backend URL.
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default nextConfig;