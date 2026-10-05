import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/urls/safe-next-path";

/**
 * Landing page for links in auth emails (confirm address, reset password).
 * Supabase verifies the link first and then redirects here with either `?code=`
 * (success — we start a session) or `?error_code=` (e.g. the link was already used).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const locale = request.cookies.get("NEXT_LOCALE")?.value ?? routing.defaultLocale;
  const loginWith = (status: string) =>
    NextResponse.redirect(new URL(`/${locale}/login?status=${status}`, request.url));

  if (params.get("error_code")) {
    console.warn("auth link error:", params.get("error_code"));
    return loginWith("linkExpired");
  }

  const code = params.get("code");
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(
        new URL(safeNextPath(params.get("next"), `/${locale}`), request.url),
      );
    }
    // Opened in a different browser than the one that asked for the link: the address
    // is confirmed, but this browser can't finish the sign-in.
    console.warn("exchangeCodeForSession failed:", error.code);
    return loginWith("confirmed");
  }
  return loginWith("linkExpired");
}
