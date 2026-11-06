import { describe, expect, it } from "vitest";

import {
  healthResponseSchema,
  paginationSchema,
  printerConnectionSchema,
  telemetryEnvelopeSchema,
} from "./contracts";

describe("platform API contracts", () => {
  it("accepts a healthy API response with unconfigured optional services", () => {
    expect(
      healthResponseSchema.safeParse({
        status: "ok",
        service: "ms3dprinting-api",
        timestamp: "2026-11-06T00:00:00.000Z",
        checks: { database: "not_configured", objectStorage: "not_configured" },
      }).success,
    ).toBe(true);
  });

  it("bounds pagination to a safe page size", () => {
    expect(paginationSchema.parse({ limit: "50" }).limit).toBe(50);
    expect(paginationSchema.safeParse({ limit: "5000" }).success).toBe(false);
  });

  it("requires stable identifiers for printer connections", () => {
    expect(
      printerConnectionSchema.safeParse({
        printerId: "not-a-uuid",
        workspaceId: "not-a-uuid",
        connectionKind: "lan",
      }).success,
    ).toBe(false);
  });

  it("keeps telemetry provenance explicit", () => {
    expect(
      telemetryEnvelopeSchema.safeParse({
        printerId: "a0f1e2d3-0000-4000-8000-000000000001",
        observedAt: "2026-11-06T00:00:00.000Z",
        source: "demo",
        status: "online",
        payload: { temperature: 22 },
      }).success,
    ).toBe(true);
  });
});
