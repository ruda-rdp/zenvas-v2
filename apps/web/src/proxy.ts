/**
 * Rate Limiting Middleware
 *
 * Protects auth endpoints from brute force attacks.
 *
 * Store abstraction (lib/rate-limit.ts):
 *   - With UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN → Upstash Redis (persistent, distributed)
 *   - Without → in-memory Map (development only; per-instance, not safe for serverless)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRateLimitStore } from "@/lib/rate-limit";

// Initialise once per cold-start (singleton within the process)
const store = createRateLimitStore();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // NextAuth v5 credentials provider callback — actual login endpoint hit by signIn("credentials")
  "/api/auth/callback/credentials": { windowMs: 60_000, maxRequests: 5 }, // 5 attempts / minute
  "/api/auth/register": { windowMs: 60_000, maxRequests: 3 }, // 3 registrations / minute
};

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const config = RATE_LIMITS[pathname];
  if (!config) return NextResponse.next();

  const ip = getClientIP(request);
  const key = `rl:${ip}:${pathname}`;

  const { allowed, remaining } = await store.incr(key, config.windowMs, config.maxRequests);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Limit": config.maxRequests.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
  return response;
}

export const config = {
  // Next.js 16 middleware matcher — exact match for precise targeting of auth endpoints
  matcher: ["/api/auth/callback/credentials", "/api/auth/register"],
};
