import { type NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

type Ctx = { params: Promise<{ proxy: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx) {
  const { proxy: segments } = await ctx.params;
  const backendUrl = BACKEND.replace(/\/$/, "") + "/" + segments.join("/");

  const url = new URL(backendUrl);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const reqHeaders = new Headers(req.headers);
  reqHeaders.delete("host");

  const isBodyMethod = !["GET", "HEAD"].includes(req.method);

  const upstream = await fetch(url.toString(), {
    method: req.method,
    headers: reqHeaders,
    body: isBodyMethod ? req.body : undefined,
    // @ts-expect-error duplex needed for streaming body
    duplex: "half",
  });

  const resHeaders = new Headers(upstream.headers);
  resHeaders.delete("content-encoding"); // avoid double-decompression

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export const GET     = proxy;
export const POST    = proxy;
export const PUT     = proxy;
export const PATCH   = proxy;
export const DELETE  = proxy;
