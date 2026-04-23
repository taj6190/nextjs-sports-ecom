import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config — no Node.js-only imports (no mongoose, no bcryptjs).
 * Used by:
 *  - proxy.ts (Edge runtime) — for route protection
 *  - auth.ts (Node runtime) — spread in as base config
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [], // Providers with DB/bcrypt are added in auth.ts (Node only)
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Must be here so edge proxy can read role from the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { nextUrl, headers } = request;
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string } | undefined)?.role;
      const { pathname } = nextUrl;

      // Robustly determine the base URL from headers to avoid localhost redirects on production
      const host = headers.get("host");
      const protocol = headers.get("x-forwarded-proto") || "http";
      const baseUrl = `${protocol}://${host}`;

      // Admin routes — must be logged in and have admin role
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
          const url = new URL("/login", baseUrl);
          url.searchParams.set("callbackUrl", "/admin");
          return Response.redirect(url);
        }
        if (role !== "admin") {
          return Response.redirect(new URL("/", baseUrl));
        }
        return true;
      }

      // Account routes — must be logged in
      if (pathname.startsWith("/account")) {
        if (!isLoggedIn) {
          const url = new URL("/login", baseUrl);
          url.searchParams.set("callbackUrl", pathname);
          return Response.redirect(url);
        }
        return true;
      }

      // Checkout — allow guests
      if (pathname.startsWith("/checkout")) {
        return true;
      }

      // Auth pages — redirect logged-in users away
      if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
        return Response.redirect(new URL("/", baseUrl));
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
};

