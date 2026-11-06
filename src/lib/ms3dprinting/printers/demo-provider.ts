import type { PrinterAdapter, PrinterConnection, PrinterTelemetry } from "./types";

/** Explicitly simulated provider for UI development; it never contacts a real printer. */
export class DemoPrinterProvider implements PrinterAdapter {
  readonly providerId = "demo";

  async discover(): Promise<PrinterConnection[]> {
    return [{
      id: "demo-bambu-a1",
      name: "Impressora de demonstração",
      model: "Bambu Lab A1 (simulada)",
      mode: "demo",
      capabilities: {
        telemetry: true,
        camera: false,
        uploadProject: false,
        startJob: false,
        pauseJob: false,
        resumeJob: false,
        cancelJob: false,
      },
    }];
  }

  async connect(_printerId: string): Promise<void> {
    // No-op by design: this provider is not a hardware connection.
  }

  async getTelemetry(printerId: string): Promise<PrinterTelemetry> {
    return {
      printerId,
      model: "Bambu Lab A1 (simulada)",
      state: "offline",
      observedAt: new Date().toISOString(),
      source: "demo",
    };
  }

  async disconnect(_printerId: string): Promise<void> {
    // No-op by design.
  }
}
