/**
 * Rate Limit Store
 *
 * Provides a persistent rate limiting store behind a simple interface.
 * Supports Upstash Redis (production) and in-memory (development).
 *
 * Single source of truth for rate-limit storage — used by proxy.ts middleware.
 */

import { Redis } from "@upstash/redis";

/**
 * Result of incrementing a rate-limit counter.
 * - count:      total requests in the current window
 * - remaining:  requests left before the limit is hit
 * - allowed:    whether this request should be allowed
 */
export interface RateLimitResult {
  count: number;
  remaining: number;
  allowed: boolean;
}

/**
 * Abstract rate-limit store interface.
 * Each implementation decides how to persist and expire entries.
 */
export interface RateLimitStore {
  /**
   * Increment the counter for `key` and return the current window state.
   * @param key         Rate-limit bucket identifier (e.g. "ip:192.168.1.1:/api/auth/register")
   * @param windowMs    Window size in milliseconds — counter resets after this duration
   * @param maxRequests Maximum allowed requests within the window; determines `remaining` and `allowed`
   */
  incr(key: string, windowMs: number, maxRequests: number): Promise<RateLimitResult>;
}

// ─── In-Memory Store (development / no Redis) ─────────────────────────────────

/**
 * In-memory store backed by a plain Map.
 *
 * WARNING: Each serverless instance / Node process gets its own Map.
 * This is fine for local development but NOT safe for multi-instance deployments.
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to enable persistent
 * distributed rate limiting in production.
 */
class InMemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; expiresAt: number }>();

  async incr(key: string, windowMs: number, maxRequests: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    // Expired or never seen → start a new window
    if (!entry || now > entry.expiresAt) {
      const expiresAt = now + windowMs;
      this.store.set(key, { count: 1, expiresAt });
      return { count: 1, remaining: maxRequests - 1, allowed: maxRequests > 1 };
    }

    entry.count++;
    const allowed = entry.count <= maxRequests;
    return {
      count: entry.count,
      remaining: Math.max(0, maxRequests - entry.count),
      allowed,
    };
  }
}

// ─── Upstash Redis Store (production) ────────────────────────────────────────

/**
 * Upstash Redis-backed store.
 * Uses INCR + EXPIRE for atomic sliding-window rate limiting.
 * TTL is handled entirely by Redis — no setInterval needed.
 */
class UpstashRedisStore implements RateLimitStore {
  private redis: Redis;

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token });
  }

  async incr(key: string, windowMs: number, maxRequests: number): Promise<RateLimitResult> {
    const ttlSec = Math.ceil(windowMs / 1000);
    const count = await this.redis.incr(key);
    // Set expiry only on first request of the window (count === 1)
    if (count === 1) {
      await this.redis.expire(key, ttlSec);
    }
    const allowed = count <= maxRequests;
    return {
      count,
      remaining: Math.max(0, maxRequests - count),
      allowed,
    };
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _store: RateLimitStore | null = null;
let _warned = false;

export function createRateLimitStore(): RateLimitStore {
  if (_store) return _store;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    _store = new UpstashRedisStore(url, token);
    console.info("[rate-limit] Upstash Redis store initialised");
  } else {
    if (!_warned) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — " +
          "using in-memory store (per-instance only, not safe for multi-instance deployments)"
      );
      _warned = true;
    }
    _store = new InMemoryStore();
  }

  return _store;
}
