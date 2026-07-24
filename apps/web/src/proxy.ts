/**
 * Rate Limiting Middleware
 *
 * Protects auth endpoints from brute force attacks.
 *
 * NOTE: This store is in-memory (per-instance). It will NOT work correctly
 * in multi-instance deployments (e.g., serverless, Kubernetes replicas).
 * This is NOT a replacement for account-level lockout (already implemented
 * in auth.ts authorize function). Will be replaced with persistent store
 * (Redis/DB) in ISSUE-10.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NOTE: In-memory store is per-process. In serverless/multi-instance deployments,
// each instance has its own independent store. This provides per-IP rate limiting
// only within a single instance. For true distributed rate limiting, use Redis
// or a database-backed store (see ISSUE-10).
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.timestamp > 60000) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // NextAuth v5 credentials provider callback - actual login endpoint hit by signIn("credentials")
  "/api/auth/callback/credentials": { windowMs: 60000, maxRequests: 5 }, // 5 attempts per minute
  "/api/auth/register": { windowMs: 60000, maxRequests: 3 }, // 3 registrations per minute
};

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now - record.timestamp > config.windowMs) {
    rateLimitStore.set(key, { count: 1, timestamp: now });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: config.maxRequests - record.count };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path matches rate-limited routes
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (pathname === path) {
      const ip = getClientIP(request);
      const key = `${ip}:${path}`;
      const { allowed, remaining } = checkRateLimit(key, config);

      if (!allowed) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }

      // Add rate limit headers
      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // NOTE: Next.js 16 middleware matcher supports literal paths and regex patterns.
  // Using exact match (= prefix) for precise targeting of auth endpoints.
  matcher: ["/api/auth/callback/credentials", "/api/auth/register"],
};
