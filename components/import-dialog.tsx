"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, Check, Plane, BedDouble } from "lucide-react";
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
import type { Flight } from "@/lib/flights";
import { applyImport } from "@/lib/actions";
import { useI18n, fill } from "@/components/i18n-provider";

type Extracted = {
  flights: Flight[];
  hotels: { name: string; area: string; checkIn?: string; checkOut?: string; pricePerNight?: number; bookingRef?: string }[];
  summary: string;
};

export default function ImportDialog({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Extracted | null>(null);
  const [error, setError] = useState("");
  const [applying, startApplying] = useTransition();

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t.importer.error);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const apply = () => {
    if (!result) return;
    startApplying(async () => {
      await applyImport(tripId, { flights: result.flights, hotels: result.hotels });
      toast.success(t.importer.applied);
      setOpen(false);
      setResult(null);
      router.refresh();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setResult(null);
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="rounded-full">
          <FileUp className="size-4" />
          {t.importer.button}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.importer.title}</DialogTitle>
          <DialogDescription>{t.importer.desc}</DialogDescription>
        </DialogHeader>

        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />

        {!result && (
          <Button onClick={() => fileRef.current?.click()} disabled={busy} variant="secondary" className="h-24 rounded-xl border border-dashed">
            {busy ? (
              <span className="flex items-center gap-2 text-primary">
                <Loader2 className="size-4 animate-spin" />
                {t.importer.extracting}
              </span>
            ) : (
              <span className="flex items-center gap-2 text-muted-foreground">
                <FileUp className="size-4" />
                {t.importer.choose}
              </span>
            )}
          </Button>
        )}

        {result && (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {fill(t.importer.found, { f: result.flights.length, h: result.hotels.length })}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {result.flights.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 rounded-lg border bg-secondary/50 px-3 py-2 text-sm">
                  <Plane className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">
                    {f.from} → {f.to} · <span className="font-mono">{f.flightNumber}</span> · {f.departure.slice(0, 10)}
                  </span>
                </li>
              ))}
              {result.hotels.map((h, i) => (
                <li key={`h${i}`} className="flex items-center gap-2.5 rounded-lg border bg-secondary/50 px-3 py-2 text-sm">
                  <BedDouble className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">
                    {h.name} · {h.area}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (result.flights.length > 0 || result.hotels.length > 0) && (
          <DialogFooter>
            <Button onClick={apply} disabled={applying} className="rounded-full px-6">
              {applying ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {t.importer.apply}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
