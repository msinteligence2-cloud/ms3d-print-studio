export type PrinterConnectionMode = "lan" | "cloud" | "demo";
export type PrintState = "idle" | "preparing" | "running" | "paused" | "finished" | "failed" | "offline";

export type PrinterCapabilities = {
  telemetry: boolean;
  camera: boolean;
  uploadProject: boolean;
  startJob: boolean;
  pauseJob: boolean;
  resumeJob: boolean;
  cancelJob: boolean;
};

export type PrinterTelemetry = {
  printerId: string;
  model: string;
  firmware?: string;
  state: PrintState;
  progressPercent?: number;
  remainingSeconds?: number;
  nozzleTemperatureC?: number;
  bedTemperatureC?: number;
  observedAt: string;
  source: "device" | "demo" | "manual";
};

export type PrinterConnection = {
  id: string;
  name: string;
  model: string;
  mode: PrinterConnectionMode;
  capabilities: PrinterCapabilities;
};

export type PrinterAdapter = {
  readonly providerId: string;
  discover(): Promise<PrinterConnection[]>;
  connect(printerId: string): Promise<void>;
  getTelemetry(printerId: string): Promise<PrinterTelemetry>;
  disconnect(printerId: string): Promise<void>;
};
