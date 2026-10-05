import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Landing page for the "confirm your email" link. Supabase has already confirmed
 * the address before redirecting here; we additionally try to start a session.
 * If the link was opened in a different browser (e.g. Safari vs. the installed app)
 * the exchange fails harmlessly and the user simply signs in with their password.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const locale = request.cookies.get("NEXT_LOCALE")?.value ?? routing.defaultLocale;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }
  return NextResponse.redirect(new URL(`/${locale}/login?confirmed=1`, request.url));
}
