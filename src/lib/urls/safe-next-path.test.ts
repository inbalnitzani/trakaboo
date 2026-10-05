import { describe, expect, it } from "vitest";

import { safeNextPath } from "./safe-next-path";

describe("safeNextPath", () => {
  it.each(["/he/new-password", "/en"])("keeps same-site path %s", (next) => {
    expect(safeNextPath(next, "/he")).toBe(next);
  });

  it.each([null, undefined, "", "https://evil.com", "//evil.com", "/\\evil.com", "evil"])(
    "falls back for %j",
    (next) => {
      expect(safeNextPath(next, "/he")).toBe("/he");
    },
  );
});
