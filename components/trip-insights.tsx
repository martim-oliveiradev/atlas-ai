"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { BedDouble, Backpack, ShieldCheck, CloudRain, Gem, Camera, CalendarRange, Heart, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { money, type Itinerary } from "@/lib/itinerary";
import { toggleFavorite } from "@/lib/actions";
import { useI18n } from "@/components/i18n-provider";
import PackingList from "@/components/packing-list";

function bookingSearchUrl(name: string, area: string) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${name}, ${area}`)}`;
}

function SectionCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-4 p-6", className)}>
      <h3 className="flex items-center gap-2.5 font-medium">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      {children}
    </Card>
  );
}

export default function TripInsights({
  itinerary,
  interactive,
  savedNames,
  tripId,
  packed,
}: {
  itinerary: Itinerary;
  interactive?: boolean;
  savedNames?: string[];
  tripId?: string;
  packed?: string[];
}) {
  const { t } = useI18n();
  const it = itinerary;
  const place = `${it.city}, ${it.country}`;
  const [saved, setSaved] = useState(() => new Set(savedNames ?? []));
  const [, startTransition] = useTransition();

  const saveHotel = (name: string, note: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    startTransition(() => {
      toggleFavorite({ kind: "hotel", name, place, note });
    });
  };

  return (
    <div className="@container grid gap-6 @2xl:grid-cols-6">
      <SectionCard icon={BedDouble} title={t.insights.whereToStay} className="@2xl:col-span-6">
        <ul className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {it.hotels.map((h) => (
            <li key={h.name} className="group overflow-hidden rounded-xl border bg-secondary/50">
              <a
                href={bookingSearchUrl(h.name, h.area)}
                target="_blank"
                rel="noopener noreferrer"
                className="block outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={`https://picsum.photos/seed/${encodeURIComponent(h.name)}-hotel/480/280`}
                    alt={h.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <ExternalLink className="absolute right-2.5 top-2.5 size-3.5 text-white/80 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-snug transition-colors group-hover:text-primary">{h.name}</p>
                    {interactive && (
                      <button
                        type="button"
                        aria-label={saved.has(h.name) ? `Remove ${h.name} from saved` : `Save ${h.name}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          saveHotel(h.name, h.note);
                        }}
                        className={cn("rounded-full p-1 transition-colors hover:bg-secondary", saved.has(h.name) ? "text-primary" : "text-muted-foreground")}
                      >
                        <Heart className={cn("size-4", saved.has(h.name) && "fill-current")} />
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {h.area} · {h.style}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.note}</p>
                  <p className="mt-3 font-mono text-sm">
                    {money(h.pricePerNight, it.currency)}
                    <span className="text-muted-foreground"> {t.insights.perNight}</span>
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard icon={CalendarRange} title={t.insights.whenToGo} className="@2xl:col-span-3">
        <p className="text-sm leading-relaxed text-muted-foreground">{it.bestTime}</p>
        <p className="border-t pt-4 text-sm leading-relaxed text-muted-foreground">{it.weather}</p>
      </SectionCard>

      <SectionCard icon={Gem} title={t.insights.hiddenGems} className="@2xl:col-span-3">
        <ul className="space-y-3">
          {it.hiddenGems.map((g) => (
            <li key={g.name} className="text-sm leading-relaxed">
              <span className="font-medium">{g.name}.</span>{" "}
              <span className="text-muted-foreground">{g.note}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard icon={Camera} title={t.insights.photoSpots} className="@2xl:col-span-3">
        <ul className="space-y-3">
          {it.photoSpots.map((p) => (
            <li key={p.name} className="text-sm leading-relaxed">
              <span className="font-medium">{p.name}.</span>{" "}
              <span className="text-muted-foreground">{p.note}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard icon={Backpack} title={t.insights.packing} className="@2xl:col-span-3">
        {interactive && tripId ? (
          <PackingList tripId={tripId} items={it.packing} packed={packed ?? []} weather={it.weather} />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {it.packing.map((p) => (
              <li key={p} className="rounded-full border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
                {p}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard icon={ShieldCheck} title={t.insights.goodToKnow} className="@2xl:col-span-3">
        <ul className="space-y-3">
          {it.safety.map((s) => (
            <li key={s} className="text-sm leading-relaxed text-muted-foreground">
              {s}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard icon={CloudRain} title={t.insights.ifItRains} className="@2xl:col-span-3">
        <ul className="space-y-3">
          {it.rainPlan.map((r) => (
            <li key={r} className="text-sm leading-relaxed text-muted-foreground">
              {r}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
