export const LICENSE_TERMS_MONTHS = [1, 3, 6, 12] as const;
export type LicenseTermMonths = (typeof LICENSE_TERMS_MONTHS)[number];

export type LicenseEntitlement = {
  status: "active" | "expired" | "revoked" | "pending";
  startsAt: string;
  expiresAt: string;
  termMonths: LicenseTermMonths;
};

/** Adds calendar months without overflowing into the following month. */
export function addCalendarMonths(date: Date, months: number): Date {
  if (!Number.isInteger(months) || months < 0) {
    throw new RangeError("months must be a non-negative integer");
  }
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

export function isEntitlementActive(
  entitlement: LicenseEntitlement,
  now = new Date(),
): boolean {
  if (entitlement.status !== "active") return false;
  const startsAt = new Date(entitlement.startsAt).getTime();
  const expiresAt = new Date(entitlement.expiresAt).getTime();
  const current = now.getTime();
  return Number.isFinite(startsAt) && Number.isFinite(expiresAt)
    && startsAt <= current && current < expiresAt;
}
