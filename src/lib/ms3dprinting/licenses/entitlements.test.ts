import { describe, expect, it } from "vitest";
import { addCalendarMonths, isEntitlementActive } from "./entitlements";

describe("license entitlement dates", () => {
  it("clamps month-end dates instead of overflowing", () => {
    expect(addCalendarMonths(new Date("2026-01-31T12:00:00Z"), 1).toISOString())
      .toBe("2026-02-28T12:00:00.000Z");
  });

  it("treats expiry as an exclusive boundary", () => {
    const license = {
      status: "active" as const,
      startsAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-02-01T00:00:00.000Z",
      termMonths: 1 as const,
    };
    expect(isEntitlementActive(license, new Date("2026-01-31T23:59:59Z"))).toBe(true);
    expect(isEntitlementActive(license, new Date("2026-02-01T00:00:00Z"))).toBe(false);
  });
});
