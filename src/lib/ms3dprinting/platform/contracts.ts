import { z } from "zod";

export const apiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  requestId: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  service: z.literal("ms3dprinting-api"),
  timestamp: z.string().datetime(),
  checks: z.object({
    database: z.enum(["not_configured", "ok", "error"]),
    objectStorage: z.enum(["not_configured", "ok", "error"]),
  }),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().min(1).optional(),
});
export type Pagination = z.infer<typeof paginationSchema>;

export const printerConnectionSchema = z.object({
  printerId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  connectionKind: z.enum(["lan", "cloud", "demo"]),
  modelCode: z.string().min(1).optional(),
  firmwareVersion: z.string().min(1).optional(),
});
export type PrinterConnection = z.infer<typeof printerConnectionSchema>;

export const telemetryEnvelopeSchema = z.object({
  printerId: z.string().uuid(),
  observedAt: z.string().datetime(),
  source: z.enum(["device", "desktop_agent", "demo", "manual"]),
  status: z.enum(["unknown", "offline", "online", "printing", "error"]),
  payload: z.record(z.string(), z.unknown()),
});
export type TelemetryEnvelope = z.infer<typeof telemetryEnvelopeSchema>;
