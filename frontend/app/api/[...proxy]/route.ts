import { type NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_API_BASE_URL ?? "https://medisimulator.onrender.com";

type Ctx = { params: Promise<{ proxy: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx) {
  const { proxy: segments } = await ctx.params;
  const backendUrl = BACKEND.replace(/\/$/, "") + "/" + segments.join("/");

  const url = new URL(backendUrl);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const reqHeaders = new Headers(req.headers);
  reqHeaders.delete("host");

  const isBodyMethod = !["GET", "HEAD"].includes(req.method);

  // Read body as ArrayBuffer — streaming via req.body + duplex:"half" is
  // unreliable on Vercel serverless and causes it to return an HTML 500 page.
  const body = isBodyMethod ? await req.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), {
      method: req.method,
      headers: reqHeaders,
      body: body ?? undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "upstream fetch failed";
    return NextResponse.json(
      { statusCode: 502, message: `Proxy could not reach backend: ${message}` },
      { status: 502 },
    );
  }

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
