import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { LOCALE_CODES } from "./i18n/locales";
import { routing } from "./i18n/routing";
import { refreshSession } from "./lib/supabase/proxy";

const intl = createIntlMiddleware(routing);

/** Pages reachable without signing in (path after the locale prefix). */
const PUBLIC_PATHS = ["/login"];

function stripLocale(pathname: string) {
  const [, first, ...rest] = pathname.split("/");
  return (LOCALE_CODES as string[]).includes(first)
    ? { locale: first, path: `/${rest.join("/")}` }
    : { locale: null, path: pathname };
}

export async function proxy(request: NextRequest) {
  // 1. Locale routing (redirects / → /he etc.).
  const response = intl(request);
  if (response.headers.has("location")) return response;

  // 2. Keep the Supabase session fresh and guard private pages.
  const { configured, signedIn } = await refreshSession(request, response);
  if (!configured) return response; // demo mode: everything is public

  const { locale, path } = stripLocale(request.nextUrl.pathname);
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

  if (!signedIn && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale ?? routing.defaultLocale}/login`;
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }
  if (signedIn && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale ?? routing.defaultLocale}`;
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }
  return response;
}

/** Carries refreshed auth cookies over to a redirect response. */
function withCookies(target: NextResponse, source: NextResponse) {
  for (const cookie of source.cookies.getAll()) target.cookies.set(cookie);
  return target;
}

export const config = {
  // All paths except API routes, Next internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
