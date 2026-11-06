import { findBambuModel } from "./models";
import type { PrinterConnection, PrinterTelemetry } from "../types";

export type BambuLanDevice = { id: string; name: string; modelCode: string; serialNumber: string; host: string };
export type BambuLanCredentials = { host: string; accessCodeReference: string };

/** Implemented inside the privileged Windows companion, never in the browser renderer. */
export type BambuLanTransport = {
  discover(): Promise<BambuLanDevice[]>;
  connect(device: BambuLanDevice, credentials: BambuLanCredentials): Promise<void>;
  readTelemetry(device: BambuLanDevice): Promise<PrinterTelemetry>;
  disconnect(deviceId: string): Promise<void>;
};

/** Read-only-first provider boundary. A real MQTT/FTPS transport is still pending. */
export class BambuLanProvider {
  readonly providerId = "bambu-lan";
  private readonly devices = new Map<string, BambuLanDevice>();
  constructor(private readonly transport: BambuLanTransport) {}

  async discover(): Promise<(PrinterConnection & { serialNumber: string; host: string; modelCode: string })[]> {
    const devices = await this.transport.discover();
    this.devices.clear();
    return devices.flatMap((device) => {
      const model = findBambuModel(device.modelCode);
      if (!model) return [];
      this.devices.set(device.id, device);
      return [{
        id: device.id, name: device.name, model: model.displayName, mode: "lan" as const,
        capabilities: model.capabilities, serialNumber: device.serialNumber,
        host: device.host, modelCode: device.modelCode,
      }];
    });
  }

  async connect(deviceId: string, credentials: BambuLanCredentials): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error("Impressora não descoberta nesta sessão.");
    if (credentials.host !== device.host) throw new Error("O endereço não corresponde à impressora descoberta.");
    if (!credentials.accessCodeReference.trim()) throw new Error("Referência segura do código de acesso ausente.");
    await this.transport.connect(device, credentials);
  }
  async getTelemetry(deviceId: string): Promise<PrinterTelemetry> {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error("Impressora não descoberta nesta sessão.");
    return this.transport.readTelemetry(device);
  }
  async disconnect(deviceId: string): Promise<void> {
    await this.transport.disconnect(deviceId);
  }
}
