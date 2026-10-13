import { describe, expect, it } from "vitest";

import { generateIngestToken, hashIngestToken, readBearerToken } from "./token";

describe("generateIngestToken", () => {
  it("makes prefixed, URL-safe, unique tokens", () => {
    const a = generateIngestToken();
    const b = generateIngestToken();
    expect(a).toMatch(/^trk_[\w-]{43}$/);
    expect(a).not.toBe(b);
  });
});

describe("hashIngestToken", () => {
  it("is SHA-256 hex, matching Postgres sha256()", () => {
    // select encode(sha256(convert_to('abc', 'UTF8')), 'hex')
    expect(hashIngestToken("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("readBearerToken", () => {
  it.each([
    ["Bearer trk_abc", "trk_abc"],
    ["bearer  trk_abc ", "trk_abc"],
    ["trk_abc", null],
    ["Bearer ", null],
    ["Bearer a b", null],
    [null, null],
  ])("%j → %j", (header, expected) => {
    expect(readBearerToken(header)).toBe(expected);
  });
});
