import { describe, expect, it } from "vitest";
import { getSupportedProjectExtension, validateProjectFile } from "./storage";

describe("project file validation", () => {
  it("accepts supported 3D project formats without case sensitivity", () => {
    expect(getSupportedProjectExtension("Bracket.STL")).toBe(".stl");
    expect(getSupportedProjectExtension("assembly.3mf")).toBe(".3mf");
    expect(getSupportedProjectExtension("part.step")).toBe(".step");
  });

  it("rejects unsupported, empty and oversized files", () => {
    expect(validateProjectFile({ name: "readme.pdf", size: 200 })).toContain("Formato");
    expect(validateProjectFile({ name: "empty.stl", size: 0 })).toContain("vazio");
    expect(validateProjectFile({ name: "large.3mf", size: 251 * 1024 * 1024 })).toContain("250 MB");
  });
});
