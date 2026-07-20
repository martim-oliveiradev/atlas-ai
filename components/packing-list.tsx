"use client";

import { useState, useTransition } from "react";
import { setPacked } from "@/lib/actions";
import { useI18n, fill } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export default function PackingList({
  tripId,
  items,
  packed,
  weather,
}: {
  tripId: string;
  items: string[];
  packed: string[];
  weather: string;
}) {
  const { t } = useI18n();
  const [done, setDone] = useState(() => new Set(packed));
  const [, startTransition] = useTransition();

  const toggle = (item: string) => {
    const next = new Set(done);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setDone(next);
    startTransition(() => setPacked(tripId, [...next]));
  };

  const count = items.filter((i) => done.has(i)).length;
  const pct = items.length ? Math.round((count / items.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{fill(t.packing.progress, { done: count, total: items.length })}</span>
          <span className="font-mono">{pct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary/60">
              <input
                type="checkbox"
                checked={done.has(item)}
                onChange={() => toggle(item)}
                className="mt-0.5 size-4 shrink-0 accent-[oklch(0.79_0.13_70)]"
              />
              <span className={cn("leading-relaxed", done.has(item) ? "text-muted-foreground line-through" : "")}>
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="border-t pt-3 text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">{t.packing.weatherNote}: </span>
        {weather}
      </p>
    </div>
  );
}
