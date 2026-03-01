import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Global middleware: protects all /api/* routes except public ones.
 * Enforces authentication via NextAuth JWT token.
 */

const PUBLIC_ROUTES = [
  "/api/auth",
  "/api/webhooks",
];

const RATE_LIMITED_ROUTES: Record<string, { max: number; windowMs: number }> = {
  "/api/auth/callback/credentials": { max: 5, windowMs: 15 * 60 * 1000 },
  "/api/whatsapp/send": { max: 30, windowMs: 60 * 1000 },
  "/api/whatsapp/send-bulk": { max: 3, windowMs: 60 * 1000 },
  "/api/professionals": { max: 10, windowMs: 60 * 1000 },
};

// In-memory rate limit store (per instance, resets on restart)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
};

const checkRateLimit = (key: string, config: { max: number; windowMs: number }): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (entry.count >= config.max) {
    return false;
  }

  entry.count++;
  return true;
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /api/* routes
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Allow public routes (auth, webhooks)
  if (isPublicRoute(pathname)) {
    // Webhook secret validation
    if (pathname.startsWith("/api/webhooks/evolution")) {
      const apiKey = req.headers.get("apikey") || req.nextUrl.searchParams.get("apikey");
      const expectedKey = process.env.EVOLUTION_API_KEY;
      // Allow if key matches OR if request comes from local Docker network
      const forwarded = req.headers.get("x-forwarded-for") || "";
      const isLocal = forwarded.startsWith("172.") || forwarded.startsWith("127.") || !forwarded;

      if (!isLocal && apiKey !== expectedKey) {
        return NextResponse.json(
          { error: "Unauthorized webhook" },
          { status: 401 }
        );
      }
    }
    return NextResponse.next();
  }

  // Rate limiting check
  for (const [route, config] of Object.entries(RATE_LIMITED_ROUTES)) {
    if (pathname.startsWith(route) && req.method === "POST") {
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
      const key = `${ip}:${route}`;

      if (!checkRateLimit(key, config)) {
        return NextResponse.json(
          { error: "Demasiadas tentativas. Tente novamente mais tarde." },
          { status: 429 }
        );
      }
    }
  }

  // Authenticate via JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // Attach user info to headers for downstream routes
  const response = NextResponse.next();
  response.headers.set("x-user-id", token.id as string);
  response.headers.set("x-user-role", token.role as string);

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
