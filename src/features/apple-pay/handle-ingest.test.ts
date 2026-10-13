import { describe, expect, it, vi } from "vitest";

import type { IngestApplePay } from "@/data/apple-pay-ingest";

import { handleApplePayIngest } from "./handle-ingest";

const NOW = new Date("2026-10-13T12:00:00Z");
const body = { amount: "₪45.90", merchant: "Aroma", time: "2026-10-13T08:00:00Z" };

function post(payload: unknown, token: string | null = "trk_ok") {
  return new Request("http://localhost/api/apple-pay", {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

async function call(request: Request, ingest: IngestApplePay = async () => "created") {
  const response = await handleApplePayIngest(request, { ingest, now: () => NOW });
  return { status: response.status, json: await response.json() };
}

describe("handleApplePayIngest", () => {
  it("saves a valid payment with the bearer token", async () => {
    const ingest = vi.fn<IngestApplePay>(async () => "created");
    expect(await call(post(body), ingest)).toEqual({ status: 201, json: { result: "created" } });
    expect(ingest).toHaveBeenCalledWith(
      "trk_ok",
      expect.objectContaining({ amount: 45.9, merchant: "Aroma", date: "2026-10-13" }),
    );
  });

  it("reports a retried payment as a duplicate", async () => {
    expect(await call(post(body), async () => "duplicate")).toEqual({
      status: 200,
      json: { result: "duplicate" },
    });
  });

  it("rejects a missing or unknown token", async () => {
    const ingest = vi.fn<IngestApplePay>(async () => "unauthorized");
    expect((await call(post(body, null), ingest)).status).toBe(401);
    expect(ingest).not.toHaveBeenCalled();
    expect((await call(post(body), ingest)).status).toBe(401);
  });

  it("explains a bad payload", async () => {
    expect(await call(post("{not json"))).toEqual({ status: 400, json: { error: "invalidJson" } });
    expect(await call(post({ merchant: "Aroma" }))).toEqual({
      status: 400,
      json: { error: "invalidPayload", fields: { amount: "required" } },
    });
  });

  it("returns 500 without leaking details when saving fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await call(post(body), async () => {
      throw new Error("db down");
    });
    expect(result).toEqual({ status: 500, json: { error: "failed" } });
  });
});
