import type { NextConfig } from "next";

const FALLBACK = "http://localhost:3000";

function resolveBackend(): string {
  const raw = (
    process.env.NEXT_API_BASE_URL ??
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
  // Proxy /api/* -> backend directly via Vercel's routing engine.
  // This replaces the [...proxy] Route Handler which has a broken regex
  // in Next.js 16 that fails to match multi-segment paths like /api/auth/login.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default nextConfig;