import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ADR-0003: Dynamic Brand-by-Domain Resolution, Single Application

const INTERNAL_DOMAINS = [
  "app.zenvas.local",
  "localhost",
  "127.0.0.1",
];

const BRAND_DOMAINS: Record<string, string> = {
  // Brand domain → brandId mapping (loaded from DB in real implementation)
  "studio.eatprayedit.com": "brand_epe",
  "app.eatprayedit.com": "brand_epe",
  "studio.balistory.com": "brand_balistory",
  "app.balistory.com": "brand_balistory",
  "studio.kreatifproduction.com": "brand_kreatif",
  "app.kreatifproduction.com": "brand_kreatif",
};

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Extract the base domain (removing port if present)
  const baseDomain = hostname.split(":")[0];

  // Determine if this is an internal app request
  const isInternalDomain = INTERNAL_DOMAINS.includes(baseDomain);

  // Check if this is a brand domain
  const brandId = BRAND_DOMAINS[baseDomain];

  // Set context headers for downstream use
  const response = NextResponse.next();
  
  if (isInternalDomain) {
    // Internal app context
    response.headers.set("x-app-context", "internal");
    response.headers.set("x-brand-id", "");
  } else if (brandId) {
    // Client Portal context
    response.headers.set("x-app-context", "client-portal");
    response.headers.set("x-brand-id", brandId);
  } else {
    // Unknown domain - return safe 404 or redirect
    // In production, this should be a branded 404 page
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // For pages, let it through but log for monitoring
    console.warn(`[Middleware] Unknown domain: ${baseDomain}`);
  }

  // Auth protection for internal routes
  if (
    !isInternalDomain &&
    !brandId &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/favicon")
  ) {
    // Redirect unknown domains to login or show 404
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
