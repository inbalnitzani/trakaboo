import { describe, expect, it } from "vitest";

import { normalizeEmail, validatePassword } from "./validation";

describe("normalizeEmail", () => {
  it("trims and lowercases valid addresses", () => {
    expect(normalizeEmail("  Me@Example.COM ")).toBe("me@example.com");
  });

  it.each(["", "no-at-sign", "a@b", "a b@c.com", null, 42])("rejects %j", (input) => {
    expect(normalizeEmail(input)).toBeNull();
  });
});

describe("validatePassword", () => {
  it("accepts 8–72 bytes and keeps the value exactly (no trimming)", () => {
    expect(validatePassword("12345678")).toBe("12345678");
    expect(validatePassword(" spaced pass ")).toBe(" spaced pass ");
    expect(validatePassword("a".repeat(72))).toHaveLength(72);
  });

  it("counts bytes, not characters", () => {
    // 37 Hebrew letters = 74 bytes in UTF-8 → too long for bcrypt.
    expect(validatePassword("א".repeat(37))).toBeNull();
  });

  it.each(["1234567", "a".repeat(73), "", undefined, 12345678])("rejects %j", (input) => {
    expect(validatePassword(input)).toBeNull();
  });
});
