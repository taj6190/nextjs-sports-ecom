import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config — no Node.js-only imports (no mongoose, no bcryptjs).
 * Used by:
 *  - proxy.ts (Edge runtime) — for route protection
 *  - auth.ts (Node runtime) — spread in as base config
 */
export const authConfig: NextAuthConfig = {
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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string } | undefined)?.role;
      const { pathname } = nextUrl;

      // Admin routes — must be logged in and have admin role
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn)
          return Response.redirect(new URL("/login?callbackUrl=/admin", nextUrl));
        if (role !== "admin")
          return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Account routes — must be logged in
      if (pathname.startsWith("/account")) {
        if (!isLoggedIn)
          return Response.redirect(
            new URL(`/login?callbackUrl=${pathname}`, nextUrl)
          );
        return true;
      }

      // Checkout — allow guests
      if (pathname.startsWith("/checkout")) {
        return true;
      }

      // Auth pages — redirect logged-in users away
      if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
};

