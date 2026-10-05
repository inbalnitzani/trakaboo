import { describe, expect, it } from "vitest";

import {
  dayOfMonth,
  daysInMonth,
  formatDate,
  formatMonth,
  isInMonth,
  isIsoDate,
  isMonthKey,
  monthRange,
  parseDayMonthYear,
  shiftMonth,
  todayIso,
  toMonthKey,
} from "./dates";

describe("month keys", () => {
  it("derives month and day from an ISO date", () => {
    expect(toMonthKey("2026-09-14")).toBe("2026-09");
    expect(dayOfMonth("2026-09-04")).toBe(4);
    expect(isInMonth("2026-09-30", "2026-09")).toBe(true);
    expect(isInMonth("2026-10-01", "2026-09")).toBe(false);
  });

  it("knows month lengths, including leap years", () => {
    expect(daysInMonth("2026-09")).toBe(30);
    expect(daysInMonth("2026-02")).toBe(28);
    expect(daysInMonth("2028-02")).toBe(29);
  });

  it("shifts across year boundaries", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-09", -12)).toBe("2025-09");
  });

  it("returns an inclusive month range", () => {
    expect(monthRange("2026-02")).toEqual({ from: "2026-02-01", to: "2026-02-28" });
  });
});

describe("isIsoDate", () => {
  it.each(["2026-09-14", "2028-02-29"])("accepts %s", (v) => expect(isIsoDate(v)).toBe(true));
  it.each(["2026-02-30", "2026-13-01", "14/09/2026", "2026-9-1"])("rejects %s", (v) =>
    expect(isIsoDate(v)).toBe(false),
  );
});

describe("isMonthKey", () => {
  it("validates YYYY-MM", () => {
    expect(isMonthKey("2026-09")).toBe(true);
    expect(isMonthKey("2026-13")).toBe(false);
    expect(isMonthKey("2026-9")).toBe(false);
    expect(isMonthKey("2026-09-01")).toBe(false);
  });
});

describe("parseDayMonthYear", () => {
  it.each([
    ["09/07/2026", "2026-07-09"],
    ["10/08/26", "2026-08-10"],
    [" 5.9.2026 ", "2026-09-05"],
    ["01-09-26", "2026-09-01"],
  ])("parses %j → %s", (input, expected) => {
    expect(parseDayMonthYear(input)).toBe(expected);
  });

  it.each(["31/02/2026", "2026-09-01", "", "abc"])("returns null for %j", (input) => {
    expect(parseDayMonthYear(input)).toBeNull();
  });
});

describe("todayIso", () => {
  it("uses the given time zone", () => {
    // 22:30 UTC on Sep 30 is already Oct 1 in Israel.
    const now = new Date("2026-09-30T22:30:00Z");
    expect(todayIso("Asia/Jerusalem", now)).toBe("2026-10-01");
    expect(todayIso("UTC", now)).toBe("2026-09-30");
  });
});

describe("formatting", () => {
  it("formats months and dates per locale", () => {
    expect(formatMonth("2026-09", "en-US")).toBe("September 2026");
    expect(formatMonth("2026-09", "he-IL")).toContain("ספטמבר");
    expect(formatDate("2026-09-14", "en-US")).toBe("Sep 14");
  });
});
