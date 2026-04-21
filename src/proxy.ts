import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

/**
 * COMBINED PROXY (Auth + Geo + Security)
 * NextAuth wrapper provides the 'auth' object to the callback.
 */
const { auth: authProxy } = NextAuth(authConfig);

export default authProxy((req) => {
  const response = NextResponse.next();
  const isDev = process.env.NODE_ENV === "development";

  // 1. GEO-DETECTION (Vercel Edge)
  // Skip cookie setting during local development to prevent potential hydration loops/flicker
  const country = req.headers.get("x-vercel-ip-country") || "BD";
  const city = req.headers.get("x-vercel-ip-city") || "Dhaka";

  response.headers.set("x-geo-country", country);
  response.headers.set("x-geo-city", city);

  if (!isDev) {
    const geoValue = `${country}:${city}`;
    const existingGeo = req.cookies.get("geo-region")?.value;
    if (existingGeo !== geoValue) {
      response.cookies.set("geo-region", geoValue, {
        maxAge: 86400,
        path: "/",
        sameSite: "lax",
      });
    }
  }

  // 2. MODERN PRODUCTION SECURITY HEADERS
  const securityHeaders: Record<string, string> = {
    "X-DNS-Prefetch-Control": "on",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
