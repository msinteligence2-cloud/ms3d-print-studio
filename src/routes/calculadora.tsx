import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import { calculatePrintCost, formatBRL } from "@/lib/ms3dprinting/costs";

export const Route = createFileRoute("/calculadora")({
  component: CostCalculatorPage,
});

function CostCalculatorPage() {
  const [grams, setGrams] = useState(85);
  const [priceKg, setPriceKg] = useState(99.9);
  const [power, setPower] = useState(180);
  const [hours, setHours] = useState(3.5);
  const [tariff, setTariff] = useState(0.95);
  const [machineRate, setMachineRate] = useState(1.5);
  const [waste, setWaste] = useState(5);
  const result = useMemo(() => calculatePrintCost({
    filamentGrams: grams,
    filamentPricePerKg: priceKg,
    printerPowerWatts: power,
    printHours: hours,
    electricityPricePerKwh: tariff,
    machineCostPerHour: machineRate,
    wastePercent: waste,
  }), [grams, priceKg, power, hours, tariff, machineRate, waste]);

  const fields = [
    { label: "Filamento utilizado", value: grams, unit: "g", min: 0, step: 1, set: setGrams },
    { label: "Preço do filamento", value: priceKg, unit: "R$/kg", min: 0, step: 0.1, set: setPriceKg },
    { label: "Potência média configurada", value: power, unit: "W", min: 0, step: 1, set: setPower },
    { label: "Duração estimada", value: hours, unit: "horas", min: 0, step: 0.1, set: setHours },
    { label: "Tarifa de energia", value: tariff, unit: "R$/kWh", min: 0, step: 0.01, set: setTariff },
    { label: "Custo da máquina", value: machineRate, unit: "R$/hora", min: 0, step: 0.1, set: setMachineRate },
    { label: "Desperdício", value: waste, unit: "%", min: 0, step: 1, set: setWaste },
  ];

  return (
    <main className="min-h-screen bg-[#202328] px-5 py-8 text-slate-100 md:px-10">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-300">
          <ArrowLeft size={16} /> Voltar ao painel
        </Link>
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-red-500/10 p-3 text-red-300"><Calculator size={24} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">MS 3D STUDIO</p>
            <h1 className="ms-display text-3xl font-bold">Calculadora de custos</h1>
            <p className="mt-1 text-sm text-slate-400">Estime filamento, energia e custo operacional por impressão.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-white/10 bg-[#292D33] p-6">
            <h2 className="mb-5 text-base font-semibold">Parâmetros da impressão</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.label} className="block text-sm text-slate-300">
                  <span className="mb-2 block">{field.label}</span>
                  <div className="flex items-center rounded-lg border border-white/10 bg-[#202328] focus-within:border-red-400/60">
                    <input
                      type="number"
                      min={field.min}
                      step={field.step}
                      value={field.value}
                      onChange={(event) => field.set(Math.max(0, Number(event.target.value)))}
                      className="w-full bg-transparent px-3 py-3 text-white outline-none"
                    />
                    <span className="px-3 text-xs text-slate-500">{field.unit}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="h-fit rounded-2xl border border-red-400/20 bg-gradient-to-br from-red-500/10 to-[#11161d] p-6">
            <p className="text-sm font-medium text-slate-400">Custo estimado por impressão</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-red-300">{formatBRL(result.totalCost)}</p>
            <div className="my-6 space-y-4">
              <CostRow label="Filamento" value={result.filamentCost} />
              <CostRow label="Energia" value={result.energyCost} />
              <CostRow label="Máquina" value={result.machineCost} />
              <CostRow label="Desperdício" value={result.wasteCost} />
              <div className="border-t border-white/10 pt-4">
                <CostRow label="Consumo estimado" value={result.energyKwh} suffix="kWh" />
                <CostRow label="Custo por grama" value={result.costPerGram} />
              </div>
            </div>
            <div className="flex gap-2 rounded-xl bg-black/20 p-3 text-xs leading-relaxed text-slate-400">
              <Info size={16} className="mt-0.5 shrink-0 text-red-300" />
              Energia calculada pela potência média configurada. Não é medição real da impressora. Ajuste os parâmetros para refletir sua máquina e tarifa.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function CostRow({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <strong className="font-semibold text-slate-100">{suffix ? `${value.toFixed(3)} ${suffix}` : formatBRL(value)}</strong>
    </div>
  );
}
