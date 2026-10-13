import type { IngestApplePay } from "@/data/apple-pay-ingest";
import { parseApplePayPayload } from "@/lib/apple-pay/payload";
import { readBearerToken } from "@/lib/apple-pay/token";

type Deps = { ingest: IngestApplePay; now: () => Date };

/**
 * POST /api/apple-pay — called by the iOS Shortcuts "Transaction" automation.
 * 201 saved · 200 already saved · 400 bad payload · 401 bad token · 500 failed.
 */
export async function handleApplePayIngest(request: Request, { ingest, now }: Deps) {
  const token = readBearerToken(request.headers.get("authorization"));
  if (!token) return Response.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalidJson" }, { status: 400 });
  }

  const parsed = parseApplePayPayload(body, now());
  if (!parsed.ok)
    return Response.json({ error: "invalidPayload", fields: parsed.errors }, { status: 400 });

  try {
    const result = await ingest(token, parsed.payment);
    if (result === "unauthorized") return Response.json({ error: "unauthorized" }, { status: 401 });
    return Response.json({ result }, { status: result === "created" ? 201 : 200 });
  } catch (error) {
    console.error("Apple Pay ingest failed", error);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
