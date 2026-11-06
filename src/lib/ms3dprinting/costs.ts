export type CostEstimateInput = {
  filamentGrams: number;
  filamentPricePerKg: number;
  printerPowerWatts: number;
  printHours: number;
  electricityPricePerKwh: number;
  machineCostPerHour?: number;
  wastePercent?: number;
};

export type CostEstimate = {
  filamentCost: number;
  energyKwh: number;
  energyCost: number;
  machineCost: number;
  wasteCost: number;
  totalCost: number;
  costPerGram: number;
};

function assertFiniteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite, non-negative number`);
  }
}

/** Calculates a transparent estimate. Energy is estimated from configured power, not telemetry. */
export function calculatePrintCost(input: CostEstimateInput): CostEstimate {
  const {
    filamentGrams,
    filamentPricePerKg,
    printerPowerWatts,
    printHours,
    electricityPricePerKwh,
    machineCostPerHour = 0,
    wastePercent = 0,
  } = input;

  const values: [string, number][] = [
    ["filamentGrams", filamentGrams],
    ["filamentPricePerKg", filamentPricePerKg],
    ["printerPowerWatts", printerPowerWatts],
    ["printHours", printHours],
    ["electricityPricePerKwh", electricityPricePerKwh],
    ["machineCostPerHour", machineCostPerHour],
    ["wastePercent", wastePercent],
  ];
  values.forEach(([name, value]) => assertFiniteNonNegative(name, value));
  if (wastePercent > 100) throw new RangeError("wastePercent cannot exceed 100");

  const filamentCost = (filamentGrams / 1000) * filamentPricePerKg;
  const energyKwh = (printerPowerWatts * printHours) / 1000;
  const energyCost = energyKwh * electricityPricePerKwh;
  const machineCost = machineCostPerHour * printHours;
  const wasteCost = filamentCost * (wastePercent / 100);
  const totalCost = filamentCost + energyCost + machineCost + wasteCost;

  return {
    filamentCost,
    energyKwh,
    energyCost,
    machineCost,
    wasteCost,
    totalCost,
    costPerGram: filamentGrams > 0 ? totalCost / filamentGrams : 0,
  };
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
