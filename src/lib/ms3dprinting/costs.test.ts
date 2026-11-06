import { describe, expect, it } from "vitest";
import { calculatePrintCost, formatBRL } from "./costs";

describe("calculatePrintCost", () => {
  it("combines filament, energy, machine overhead and waste", () => {
    const result = calculatePrintCost({
      filamentGrams: 100,
      filamentPricePerKg: 100,
      printerPowerWatts: 200,
      printHours: 5,
      electricityPricePerKwh: 1,
      machineCostPerHour: 2,
      wastePercent: 10,
    });

    expect(result.filamentCost).toBe(10);
    expect(result.energyKwh).toBe(1);
    expect(result.energyCost).toBe(1);
    expect(result.machineCost).toBe(10);
    expect(result.wasteCost).toBe(1);
    expect(result.totalCost).toBe(22);
  });

  it("returns zero cost for a zero-quantity job", () => {
    expect(calculatePrintCost({
      filamentGrams: 0,
      filamentPricePerKg: 90,
      printerPowerWatts: 0,
      printHours: 0,
      electricityPricePerKwh: 1,
    }).totalCost).toBe(0);
  });

  it("rejects invalid and negative values", () => {
    expect(() => calculatePrintCost({
      filamentGrams: -1,
      filamentPricePerKg: 90,
      printerPowerWatts: 100,
      printHours: 1,
      electricityPricePerKwh: 1,
    })).toThrow(RangeError);
    expect(() => calculatePrintCost({
      filamentGrams: 10,
      filamentPricePerKg: 90,
      printerPowerWatts: 100,
      printHours: 1,
      electricityPricePerKwh: 1,
      wastePercent: 101,
    })).toThrow(RangeError);
  });
});

describe("formatBRL", () => {
  it("formats values using Brazilian currency conventions", () => {
    expect(formatBRL(12.5)).toContain("12,50");
  });
});
