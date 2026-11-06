import type { PrinterCapabilities } from "../types";

export type BambuModelId = "A1_MINI" | "A1" | "P1P" | "P1S" | "X1" | "X1_CARBON" | "X1E" | "P2S" | "H2D" | "H2D_PRO" | "H2S" | "H2C" | "X2D";
export type BambuModelProfile = {
  id: BambuModelId; displayName: string; series: "A1" | "P1" | "X1" | "P2" | "H2" | "X2";
  modelCodes: readonly string[]; ams: "none" | "ams-lite" | "ams";
  camera: "none" | "low-rate" | "rtsp"; capabilities: PrinterCapabilities;
  validation: "reference-target" | "planned";
};
const safeCapabilities: PrinterCapabilities = {
  telemetry: true, camera: false, uploadProject: false, startJob: false,
  pauseJob: false, resumeJob: false, cancelJob: false,
};
function entry(data: Omit<BambuModelProfile, "capabilities">): BambuModelProfile {
  return { ...data, capabilities: { ...safeCapabilities, camera: data.camera !== "none" } };
}
export const BAMBU_MODEL_CATALOG: readonly BambuModelProfile[] = [
  entry({ id:"A1_MINI",displayName:"Bambu Lab A1 Mini",series:"A1",modelCodes:["N1"],ams:"ams-lite",camera:"low-rate",validation:"reference-target" }),
  entry({ id:"A1",displayName:"Bambu Lab A1",series:"A1",modelCodes:["N2S"],ams:"ams-lite",camera:"low-rate",validation:"planned" }),
  entry({ id:"P1P",displayName:"Bambu Lab P1P",series:"P1",modelCodes:["C11"],ams:"ams",camera:"low-rate",validation:"planned" }),
  entry({ id:"P1S",displayName:"Bambu Lab P1S",series:"P1",modelCodes:["C12"],ams:"ams",camera:"low-rate",validation:"planned" }),
  entry({ id:"X1",displayName:"Bambu Lab X1",series:"X1",modelCodes:["BL-P002"],ams:"ams",camera:"rtsp",validation:"planned" }),
  entry({ id:"X1_CARBON",displayName:"Bambu Lab X1 Carbon",series:"X1",modelCodes:["BL-P001"],ams:"ams",camera:"rtsp",validation:"planned" }),
  entry({ id:"X1E",displayName:"Bambu Lab X1E",series:"X1",modelCodes:["C13"],ams:"ams",camera:"rtsp",validation:"planned" }),
  entry({ id:"P2S",displayName:"Bambu Lab P2S",series:"P2",modelCodes:["N7"],ams:"ams",camera:"low-rate",validation:"planned" }),
  entry({ id:"H2D",displayName:"Bambu Lab H2D",series:"H2",modelCodes:["O1D"],ams:"ams",camera:"rtsp",validation:"planned" }),
  entry({ id:"H2D_PRO",displayName:"Bambu Lab H2D Pro",series:"H2",modelCodes:["O1E"],ams:"ams",camera:"rtsp",validation:"planned" }),
  entry({ id:"H2S",displayName:"Bambu Lab H2S",series:"H2",modelCodes:["O1S"],ams:"ams",camera:"rtsp",validation:"planned" }),
  entry({ id:"H2C",displayName:"Bambu Lab H2C",series:"H2",modelCodes:["O1C2"],ams:"ams",camera:"rtsp",validation:"planned" }),
  entry({ id:"X2D",displayName:"Bambu Lab X2D",series:"X2",modelCodes:["N6"],ams:"ams",camera:"rtsp",validation:"planned" }),
];
export function findBambuModel(value: string): BambuModelProfile | undefined {
  const normalized = value.trim().toUpperCase();
  return BAMBU_MODEL_CATALOG.find((model) => model.id === normalized || model.modelCodes.some((code) => code.toUpperCase() === normalized));
}
export function getBambuModelCapabilities(value: string): PrinterCapabilities {
  return findBambuModel(value)?.capabilities ?? { ...safeCapabilities, telemetry: false };
}
