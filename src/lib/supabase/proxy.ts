import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/**
 * Refreshes the Supabase session for this request, writing updated auth cookies
 * onto `response`. Returns whether a valid (verified) user is signed in.
 */
export async function refreshSession(request: NextRequest, response: NextResponse) {
  const env = getSupabaseEnv();
  if (!env) return { configured: false, signedIn: false } as const;

  const supabase = createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  // getClaims() verifies the JWT; never trust getSession() on the server.
  const { data } = await supabase.auth.getClaims();
  return { configured: true, signedIn: !!data?.claims?.sub } as const;
}
