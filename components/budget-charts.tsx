"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowRightLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { money, type Itinerary } from "@/lib/itinerary";
import type { Rates } from "@/lib/rates";
import { useI18n, fill } from "@/components/i18n-provider";

const TARGETS = ["EUR", "USD", "GBP", "JPY", "CHF", "BRL", "CAD", "AUD"];

const CATEGORY_KEYS: (keyof Itinerary["budget"])[] = [
  "accommodation",
  "flights",
  "food",
  "transport",
  "activities",
  "shopping",
  "emergency",
];

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "oklch(0.42 0.02 265)",
  "oklch(0.34 0.015 265)",
];

function ChartTooltip({ active, payload, currency }: { active?: boolean; payload?: { name: string; value: number; payload?: { label?: string } }[]; currency: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-lg">
      <p className="text-muted-foreground">{payload[0].payload?.label ?? payload[0].name}</p>
      <p className="font-mono font-medium">{money(payload[0].value, currency)}</p>
    </div>
  );
}

export default function BudgetCharts({
  itinerary,
  statedBudget,
  rates,
}: {
  itinerary: Itinerary;
  statedBudget?: number;
  rates?: Rates | null;
}) {
  const { t } = useI18n();
  const { budget, currency, days, totalCost } = itinerary;
  const [target, setTarget] = useState(currency);
  useEffect(() => {
    const saved = localStorage.getItem("atlas-currency");
    if (saved && rates?.rates[saved] != null) setTarget(saved);
  }, [rates]);
  const rate = target !== currency ? rates?.rates[target] : null;
  const convert = (n: number) => (rate ? money(n * rate, target) : null);
  const catLabel = (key: keyof Itinerary["budget"]) =>
    key === "emergency" ? t.budget.emergencyReserve : t.budget[key];
  const pieData = CATEGORY_KEYS.map((key) => ({ name: catLabel(key), value: budget[key] })).filter((d) => d.value > 0);
  const barData = days.map((d) => ({ name: `D${d.day}`, value: d.dailyCost, label: fill(t.days, { n: d.day }) }));
  const dailyAvg = Math.round(days.reduce((s, d) => s + d.dailyCost, 0) / Math.max(days.length, 1));
  const biggest = [...pieData].sort((a, b) => b.value - a.value)[0];
  const remaining = statedBudget ? statedBudget - totalCost : budget.emergency;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          [t.budget.estimatedTotal, money(totalCost, currency)],
          [t.budget.avgPerDay, money(dailyAvg, currency)],
          [t.budget.biggestCategory, biggest ? biggest.name : ""],
          [statedBudget ? t.budget.leftInBudget : t.budget.emergencyReserve, money(remaining, currency)],
        ].map(([label, value], i) => (
          <Card key={label} className="gap-1 p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="truncate font-mono text-xl font-medium">{value}</p>
            {rate && i === 0 && (
              <p className="truncate font-mono text-xs text-primary">{fill(t.currency.approx, { amount: convert(totalCost)! })}</p>
            )}
          </Card>
        ))}
      </div>

      {rates && (
        <Card className="flex-row flex-wrap items-center gap-x-6 gap-y-3 p-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRightLeft className="size-4 text-primary" />
            {t.currency.showIn}
            <select
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                localStorage.setItem("atlas-currency", e.target.value);
              }}
              className="rounded-lg border bg-secondary px-3 py-1.5 text-sm text-foreground [color-scheme:dark]"
            >
              {[currency, ...TARGETS.filter((c) => c !== currency && rates.rates[c] != null)].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          {rate ? (
            <>
              <p className="font-mono text-sm">
                {money(totalCost, currency)}
                <span className="mx-2 text-muted-foreground">→</span>
                <span className="text-primary">{convert(totalCost)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {fill(t.currency.rateLine, { base: currency, rate: rate.toFixed(4), target, date: rates.date })}
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">{money(totalCost, currency)}</p>
          )}
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="gap-0 p-6 lg:col-span-2">
          <h3 className="font-medium">{t.budget.whereMoneyGoes}</h3>
          <div className="relative mx-auto mt-2 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={2} strokeWidth={0}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip currency={currency} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-mono text-lg font-semibold">{money(totalCost, currency)}</p>
              <p className="text-xs text-muted-foreground">{t.budget.allIn}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {pieData.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {d.name}
                </span>
                <span className="font-mono">{money(d.value, currency)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="gap-0 p-6 lg:col-span-3">
          <h3 className="font-medium">{t.budget.dailySpend}</h3>
          <p className="text-sm text-muted-foreground">{t.budget.dailySpendSub}</p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 0, left: -18, bottom: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "oklch(1 0 0 / 4%)" }} content={<ChartTooltip currency={currency} />} />
                <Bar dataKey="value" name="Spend" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
