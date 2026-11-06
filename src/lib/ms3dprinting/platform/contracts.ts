import { z } from "zod";

export const apiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  requestId: z.string().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  service: z.literal("ms-3d-studio-api"),
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

export const workspaceRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);
export const workspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  role: workspaceRoleSchema,
});
export type Workspace = z.infer<typeof workspaceSchema>;

export const projectMetadataSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).optional(),
  sourceUrl: z.string().url().optional(),
  creatorName: z.string().trim().max(120).optional(),
  licenseLabel: z.string().trim().max(120).optional(),
  tags: z.array(z.string().trim().min(1).max(32)).max(30).default([]),
});
export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;

export const filamentSchema = z.object({
  brand: z.string().trim().min(1).max(80),
  material: z.enum(["PLA", "PETG", "ABS", "ASA", "TPU", "PA", "PC", "OTHER"]),
  colorName: z.string().trim().min(1).max(60),
  diameterMm: z.number().positive().max(3).default(1.75),
  spoolWeightGrams: z.number().positive().max(10000),
  purchasePriceCents: z.number().int().nonnegative(),
});
export type Filament = z.infer<typeof filamentSchema>;

export const printJobSchema = z.object({
  printerId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  status: z.enum(["queued", "preparing", "printing", "completed", "failed", "cancelled"]),
  estimatedDurationSeconds: z.number().int().positive().optional(),
  estimatedFilamentGrams: z.number().positive().optional(),
});
export type PrintJob = z.infer<typeof printJobSchema>;

export const licenseTermSchema = z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]);
export const licenseIssueSchema = z.object({
  workspaceId: z.string().uuid(),
  planCode: z.string().trim().min(1).max(40),
  termMonths: licenseTermSchema,
  activationLimit: z.number().int().min(1).max(100).default(1),
});
export type LicenseIssue = z.infer<typeof licenseIssueSchema>;
