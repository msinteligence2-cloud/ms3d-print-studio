import { describe, expect, it } from "vitest";
import { BAMBU_MODEL_CATALOG, findBambuModel, getBambuModelCapabilities } from "./models";

describe("Bambu model catalog", () => {
  it("sets A1 Mini as the first hardware reference target", () => {
    expect(findBambuModel("N1")?.id).toBe("A1_MINI");
    expect(findBambuModel("A1_MINI")?.validation).toBe("reference-target");
    expect(findBambuModel("N1")?.ams).toBe("ams-lite");
  });
  it("recognizes multiple Bambu printer families", () => {
    for (const id of ["A1","P1S","X1_CARBON","X1E","P2S","H2D","H2S","H2C","X2D"]) expect(findBambuModel(id)).toBeDefined();
    expect(BAMBU_MODEL_CATALOG.length).toBeGreaterThanOrEqual(10);
  });
  it("keeps print controls disabled before physical qualification", () => {
    for (const model of BAMBU_MODEL_CATALOG) {
      expect(model.capabilities.startJob).toBe(false);
      expect(model.capabilities.pauseJob).toBe(false);
      expect(model.capabilities.cancelJob).toBe(false);
      expect(model.capabilities.uploadProject).toBe(false);
    }
  });
  it("fails closed for unknown model codes", () => {
    expect(getBambuModelCapabilities("UNKNOWN").telemetry).toBe(false);
  });
});
