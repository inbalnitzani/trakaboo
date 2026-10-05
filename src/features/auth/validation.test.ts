import { describe, expect, it } from "vitest";

import { normalizeEmail, normalizeOtp } from "./validation";

describe("normalizeEmail", () => {
  it("trims and lowercases valid addresses", () => {
    expect(normalizeEmail("  Me@Example.COM ")).toBe("me@example.com");
  });

  it.each(["", "no-at-sign", "a@b", "a b@c.com", null, 42])("rejects %j", (input) => {
    expect(normalizeEmail(input)).toBeNull();
  });
});

describe("normalizeOtp", () => {
  it("accepts 6 digits, ignoring spaces and dashes", () => {
    expect(normalizeOtp("123456")).toBe("123456");
    expect(normalizeOtp(" 123 456 ")).toBe("123456");
    expect(normalizeOtp("123-456")).toBe("123456");
  });

  it.each(["12345", "1234567", "abcdef", "", undefined])("rejects %j", (input) => {
    expect(normalizeOtp(input)).toBeNull();
  });
});
