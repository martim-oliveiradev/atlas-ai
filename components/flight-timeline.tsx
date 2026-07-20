"use client";

import { Plane, PlaneTakeoff, Luggage, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fmtDuration, localDate, localTime, minutesBetween, tzOffset, type Flight } from "@/lib/flights";
import { useI18n, fill } from "@/components/i18n-provider";
import ImportDialog from "@/components/import-dialog";

function offsetDiff(a: string, b: string): string | null {
  const oa = tzOffset(a);
  const ob = tzOffset(b);
  if (!oa || !ob || oa === ob) return null;
  const toMin = (o: string) => {
    const m = o.match(/([+-])(\d{2}):?(\d{2})/);
    if (!m) return 0;
    return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
  };
  const d = (toMin(ob) - toMin(oa)) / 60;
  return `${d >= 0 ? "+" : ""}${d}h`;
}

function Leg({ f }: { f: Flight }) {
  const { t } = useI18n();
  const dur = fmtDuration(minutesBetween(f.departure, f.arrival));
  const tz = offsetDiff(f.departure, f.arrival);
  const nextDay = localDate(f.arrival) !== localDate(f.departure);

  return (
    <Card className="gap-5 p-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <PlaneTakeoff className="size-4 text-primary" />
          {f.airline} · <span className="font-mono">{f.flightNumber}</span>
        </span>
        <span>{localDate(f.departure)}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-20 shrink-0">
          <p className="font-mono text-2xl font-semibold">{localTime(f.departure)}</p>
          <p className="text-sm font-medium">{f.from}</p>
          <p className="truncate text-xs text-muted-foreground">{f.fromCity}</p>
        </div>
        <div className="relative grow">
          <div className="h-px w-full border-t border-dashed border-primary/50" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-card p-1.5">
            <Plane className="size-3.5 rotate-45 text-primary" />
          </div>
          <p className="absolute inset-x-0 -bottom-5 text-center font-mono text-xs text-muted-foreground">{dur}</p>
        </div>
        <div className="w-20 shrink-0 text-right">
          <p className="font-mono text-2xl font-semibold">
            {localTime(f.arrival)}
            {nextDay && <sup className="ml-0.5 text-xs text-primary">+1</sup>}
          </p>
          <p className="text-sm font-medium">{f.to}</p>
          <p className="truncate text-xs text-muted-foreground">{f.toCity}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 text-xs text-muted-foreground">
        {f.terminal && (
          <span className="rounded-full border bg-secondary px-2.5 py-1">{fill(t.flights.terminal, { t: f.terminal })}</span>
        )}
        {f.gate && <span className="rounded-full border bg-secondary px-2.5 py-1">{fill(t.flights.gate, { g: f.gate })}</span>}
        {f.baggage && (
          <span className="flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-1">
            <Luggage className="size-3" />
            {f.baggage}
          </span>
        )}
        {tz && <span className="rounded-full border bg-secondary px-2.5 py-1">{fill(t.flights.tzChange, { d: tz })}</span>}
        {f.bookingRef && (
          <span className="flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-1 font-mono">
            <Ticket className="size-3" />
            {f.bookingRef}
          </span>
        )}
      </div>
    </Card>
  );
}

export default function FlightTimeline({ tripId, flights }: { tripId: string; flights: Flight[] }) {
  const { t } = useI18n();

  if (flights.length === 0) {
    return (
      <Card className="items-center gap-4 p-12 text-center">
        <Plane className="size-8 text-primary" />
        <div>
          <h2 className="text-lg font-medium">{t.flights.empty}</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{t.flights.emptySub}</p>
        </div>
        <ImportDialog tripId={tripId} />
      </Card>
    );
  }

  const totalAir = flights.reduce((s, f) => s + minutesBetween(f.departure, f.arrival), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {fill(t.flights.inAir, { n: flights.length, d: fmtDuration(totalAir) })}
        </p>
        <ImportDialog tripId={tripId} />
      </div>
      {flights.map((f, i) => {
        const prev = flights[i - 1];
        const layover = prev && prev.to === f.from ? minutesBetween(prev.arrival, f.departure) : null;
        return (
          <div key={`${f.flightNumber}-${f.departure}`} className="space-y-4">
            {layover != null && layover > 0 && layover < 24 * 60 && (
              <div className="flex items-center gap-3 pl-6">
                <div className="h-8 w-px border-l border-dashed" />
                <p className="text-xs text-muted-foreground">
                  {fill(t.flights.layover, { d: fmtDuration(layover), city: f.fromCity })}
                </p>
              </div>
            )}
            <Leg f={f} />
          </div>
        );
      })}
    </div>
  );
}
