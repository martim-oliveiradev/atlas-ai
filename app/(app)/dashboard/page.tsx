import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { money, parseItinerary } from "@/lib/itinerary";
import { parseFlights } from "@/lib/flights";
import WorldMap, { type MapPin } from "@/components/world-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDict, getLocale } from "@/lib/i18n-server";
import { fill, type Dict } from "@/lib/i18n";

export const metadata: Metadata = { title: "Dashboard" };

function tripEnd(t: { startDate: Date | null; days: number }) {
  if (!t.startDate) return null;
  const end = new Date(t.startDate);
  end.setDate(end.getDate() + t.days);
  return end;
}

function TripCard({
  trip,
  t,
  fmt,
}: {
  trip: { id: string; title: string; city: string; country: string; startDate: Date | null; days: number; budget: number; currency: string };
  t: Dict;
  fmt: Intl.DateTimeFormat;
}) {
  const end = tripEnd(trip);
  const past = end ? end < new Date() : false;
  return (
    <Link href={`/trips/${trip.id}`} className="group">
      <Card className="gap-0 overflow-hidden p-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30">
        <div className="relative h-36 overflow-hidden">
          <Image
            src={`https://picsum.photos/seed/${encodeURIComponent(trip.city)}-atlas/640/360`}
            alt={`${trip.city}, ${trip.country}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge variant="secondary" className="glass absolute right-3 top-3 rounded-full border-0">
            {past ? t.dashboard.statusPast : t.dashboard.statusUpcoming}
          </Badge>
        </div>
        <div className="space-y-1 p-5">
          <h3 className="truncate font-medium">{trip.title}</h3>
          <p className="truncate text-sm text-muted-foreground">
            {trip.city}, {trip.country}
          </p>
          <div className="flex items-center justify-between pt-2 text-sm">
            <span className="text-muted-foreground">
              {trip.startDate && end ? `${fmt.format(trip.startDate)} - ${fmt.format(end)}` : fill(t.trip.days, { n: trip.days })}
            </span>
            <span className="font-mono">{money(trip.budget, trip.currency)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const uid = session!.user.id;
  const [trips, favoriteCount, t, locale] = await Promise.all([
    prisma.trip.findMany({ where: { userId: uid }, orderBy: { createdAt: "desc" } }),
    prisma.favorite.count({ where: { userId: uid } }),
    getDict(),
    getLocale(),
  ]);
  const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });

  const now = new Date();
  const upcoming = trips.filter((t) => (tripEnd(t) ?? now) >= now);
  const past = trips.filter((t) => (tripEnd(t) ?? now) < now);
  const countries = [...new Set(trips.map((t) => t.country))];
  const totalDays = trips.reduce((s, t) => s + t.days, 0);
  const avgDays = trips.length ? Math.round(totalDays / trips.length) : 0;
  const totalFlights = trips.reduce((s, t) => s + parseFlights(t.flights).length, 0);
  const firstName = (session!.user.name ?? "traveler").split(" ")[0];

  const pins: MapPin[] = trips.flatMap((trip) => {
    const it = parseItinerary(trip.itinerary);
    for (const d of it?.days ?? []) {
      for (const key of ["morning", "afternoon", "breakfast", "lunch", "dinner", "night"] as const) {
        const s = d[key];
        if (s.lat != null && s.lng != null) return [{ lat: s.lat, lng: s.lng, title: `${trip.city}, ${trip.country}` }];
      }
    }
    return [];
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{fill(t.dashboard.welcome, { name: firstName })}</h1>
          <p className="mt-1 text-muted-foreground">
            {upcoming.length > 0
              ? fill(upcoming.length === 1 ? t.dashboard.onHorizon : t.dashboard.onHorizonPlural, { count: upcoming.length })
              : t.dashboard.empty}
          </p>
        </div>
        <Button asChild className="rounded-full px-5">
          <Link href="/new">
            <Plus className="size-4" />
            {t.common.planTrip}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {[
          [t.dashboard.tripsPlanned, String(trips.length)],
          [t.dashboard.countries, String(countries.length)],
          [t.dashboard.daysOnRoad, String(totalDays)],
          [t.dashboard.avgDuration, fill(t.dashboard.daysUnit, { n: avgDays })],
          [t.dashboard.totalFlights, String(totalFlights)],
          [t.dashboard.savedPlaces, String(favoriteCount)],
        ].map(([label, value]) => (
          <Card key={label} className="gap-1 p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="truncate font-mono text-2xl font-medium">{value}</p>
          </Card>
        ))}
      </div>

      {pins.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-medium">{t.dashboard.worldTitle}</h2>
          <WorldMap pins={pins} />
        </section>
      )}

      {countries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t.dashboard.atlasSoFar}</span>
          {countries.map((c) => (
            <span key={c} className="rounded-full border bg-secondary px-3 py-1 text-sm">
              {c}
            </span>
          ))}
        </div>
      )}

      {trips.length === 0 ? (
        <Card className="items-center gap-4 p-12 text-center">
          <Sparkles className="size-8 text-primary" />
          <div>
            <h2 className="text-lg font-medium">{t.dashboard.noTripsTitle}</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{t.dashboard.noTripsSub}</p>
          </div>
          <Button asChild className="rounded-full px-6">
            <Link href="/new">{t.dashboard.planFirst}</Link>
          </Button>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-medium">{t.dashboard.upcoming}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((trip) => (
                  <TripCard key={trip.id} trip={trip} t={t} fmt={fmt} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-medium">{t.dashboard.past}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((trip) => (
                  <TripCard key={trip.id} trip={trip} t={t} fmt={fmt} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
