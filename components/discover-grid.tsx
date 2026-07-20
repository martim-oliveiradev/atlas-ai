"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DESTINATIONS, FILTERS, destinationPrompt, type Destination } from "@/lib/discover";
import { toggleFavorite } from "@/lib/actions";
import { useI18n, fill } from "@/components/i18n-provider";
import type { Dict } from "@/lib/i18n";

function DestinationCard({ d, saved, onSave, t }: { d: Destination; saved: boolean; onSave: () => void; t: Dict }) {
  return (
    <Card className="group gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={`https://picsum.photos/seed/${encodeURIComponent(d.name)}-travel/640/400`}
          alt={`${d.name}, ${d.country}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <button
          type="button"
          onClick={onSave}
          aria-label={saved ? `Remove ${d.name} from saved` : `Save ${d.name}`}
          className={cn(
            "glass absolute right-3 top-3 rounded-full p-2 transition-colors",
            saved ? "text-primary" : "text-white/80 hover:text-white"
          )}
        >
          <Heart className={cn("size-4", saved && "fill-current")} />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-semibold text-white">{d.name}</h3>
          <p className="text-sm text-white/70">{d.country}</p>
        </div>
      </div>
      <div className="flex grow flex-col p-5">
        <p className="grow text-sm leading-relaxed text-muted-foreground">{d.blurb}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {fill(t.discover.best, { season: d.best })} · <span className="font-mono">{d.price}</span>
          </span>
          <Link
            href={`/new?prefill=${encodeURIComponent(destinationPrompt(d))}`}
            className="flex items-center gap-1 rounded-full border bg-secondary px-3.5 py-1.5 text-sm transition-colors hover:border-primary/40 hover:text-primary"
          >
            {t.discover.planTrip}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function DiscoverGrid({ savedNames }: { savedNames: string[] }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<string>("all");
  const [saved, setSaved] = useState(() => new Set(savedNames));
  const [, startTransition] = useTransition();

  const visible = DESTINATIONS.filter((d) => filter === "all" || d.tags.includes(filter as Destination["tags"][number]));

  const save = (d: Destination) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(d.name)) next.delete(d.name);
      else next.add(d.name);
      return next;
    });
    startTransition(() => {
      toggleFavorite({ kind: "city", name: d.name, place: d.country, note: d.blurb });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map(([key]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
              filter === key
                ? "border-primary/40 bg-primary/15 text-primary"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {t.discover.filters[key]}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((d) => (
          <DestinationCard key={d.name} d={d} saved={saved.has(d.name)} onSave={() => save(d)} t={t} />
        ))}
      </div>
      {visible.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">{t.discover.empty}</p>
      )}
    </div>
  );
}
