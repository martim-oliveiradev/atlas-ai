"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Wand2, Loader2, Check, Clock, Coins, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { itinerarySchema, money, optimizeResponseSchema, type Itinerary } from "@/lib/itinerary";
import { updateItinerary } from "@/lib/actions";
import { useI18n, fill } from "@/components/i18n-provider";

function fmtMin(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}

export default function OptimizeDialog({ tripId, itinerary }: { tripId: string; itinerary: Itinerary }) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [applying, startApplying] = useTransition();

  const { object, submit, isLoading, error } = useObject({
    api: "/api/optimize",
    schema: optimizeResponseSchema,
  });

  const report = object?.report;
  const done = !isLoading && !!report?.summary && itinerarySchema.safeParse(object?.itinerary).success;

  const apply = () => {
    const optimized = object?.itinerary;
    if (!optimized) return;
    startApplying(async () => {
      await updateItinerary(tripId, optimized as Itinerary);
      toast.success(t.optimize.applied);
      router.refresh();
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <Wand2 className="size-4" />
          {t.optimize.button}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="size-4 text-primary" />
            {t.optimize.title}
          </DialogTitle>
          <DialogDescription>{t.optimize.desc}</DialogDescription>
        </DialogHeader>

        {!report && !isLoading && (
          <Button onClick={() => submit({ itinerary })} className="rounded-full">
            <Wand2 className="size-4" />
            {t.optimize.run}
          </Button>
        )}

        {isLoading && !report?.summary && (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="size-4 animate-spin" />
              {t.optimize.analyzing}
            </p>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        )}

        {report?.summary && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                [Clock, t.optimize.timeSaved, fmtMin(report.timeSavedMinutes ?? 0)],
                [Coins, t.optimize.costSaved, money(report.costSaved ?? 0, itinerary.currency)],
                [TrendingUp, t.optimize.efficiency, `+${Math.round(report.efficiencyGain ?? 0)}%`],
              ].map(([Icon, label, value]) => {
                const I = Icon as React.ComponentType<{ className?: string }>;
                return (
                  <div key={label as string} className="rounded-xl border bg-secondary/50 p-3">
                    <I className="size-4 text-primary" />
                    <p className="mt-2 font-mono text-lg font-semibold">{value as string}</p>
                    <p className="text-xs text-muted-foreground">{label as string}</p>
                  </div>
                );
              })}
            </div>
            {(report.changes?.length ?? 0) > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">{t.optimize.changes}</p>
                <ul className="space-y-1.5">
                  {report.changes!.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {isLoading && (
              <p className="flex items-center gap-2 text-xs text-primary">
                <Loader2 className="size-3 animate-spin" />
                {t.optimize.analyzing}
              </p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{t.optimize.error}</p>}

        {done && (
          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)} className="rounded-full">
              {t.optimize.keep}
            </Button>
            <Button onClick={apply} disabled={applying} className="rounded-full px-6">
              {applying ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {t.optimize.apply}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
