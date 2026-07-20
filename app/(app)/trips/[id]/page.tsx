import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseItinerary, money, type Itinerary } from "@/lib/itinerary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ItineraryView from "@/components/itinerary-view";
import TripMap from "@/components/trip-map";
import BudgetChartsLazy from "@/components/budget-charts-lazy";
import TripInsights from "@/components/trip-insights";
import ChatPanel from "@/components/chat-panel";
import TripActions from "@/components/trip-actions";
import OptimizeDialog from "@/components/optimize-dialog";
import FlightTimeline from "@/components/flight-timeline";
import WeatherStrip from "@/components/weather-strip";
import { parseFlights } from "@/lib/flights";
import { getRates } from "@/lib/rates";
import { forecastWindow, getForecast } from "@/lib/weather";
import { getDict, getLocale } from "@/lib/i18n-server";
import { fill } from "@/lib/i18n";

export const metadata: Metadata = { title: "Trip" };

const TABS = ["itinerary", "map", "budget", "flights", "insights"] as const;

async function WeatherSection({ itinerary, startDate }: { itinerary: Itinerary; startDate: string }) {
  const spot = itinerary.days
    .flatMap((d) => [d.morning, d.afternoon, d.breakfast, d.lunch, d.dinner, d.night])
    .find((s) => s.lat != null && s.lng != null);
  const win = forecastWindow(new Date(startDate), itinerary.days.length);
  if (!spot || !win) return null;
  const forecast = await getForecast(spot.lat!, spot.lng!, win.start, win.end);
  if (!forecast?.length) return null;
  return <WeatherStrip forecast={forecast} startDate={startDate} />;
}

async function BudgetSection({ itinerary }: { itinerary: Itinerary }) {
  const rates = await getRates(itinerary.currency);
  return <BudgetChartsLazy itinerary={itinerary} rates={rates} />;
}

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const trip = await prisma.trip.findFirst({
    where: { id, userId: session!.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  const itinerary = parseItinerary(trip?.itinerary ?? null);
  if (!trip || !itinerary) notFound();

  const [favorites, t, locale] = await Promise.all([
    prisma.favorite.findMany({ where: { userId: session!.user.id }, select: { name: true } }),
    getDict(),
    getLocale(),
  ]);
  const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" });
  const flights = parseFlights(trip.flights);
  const packed: string[] = (() => {
    try {
      return trip.packed ? JSON.parse(trip.packed) : [];
    } catch {
      return [];
    }
  })();
  const savedNames = favorites.map((f) => f.name);
  const chatMessages = trip.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="no-print mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t.trip.backToDashboard}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{itinerary.title}</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{itinerary.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                `${itinerary.city}, ${itinerary.country}`,
                trip.startDate ? fmt.format(trip.startDate) : fill(t.trip.days, { n: trip.days }),
                fill(t.trip.estimated, { amount: money(itinerary.totalCost, itinerary.currency) }),
              ].map((chip) => (
                <span key={chip} className="rounded-full border bg-secondary px-3.5 py-1.5 text-sm text-muted-foreground">
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="no-print flex flex-col items-end gap-2">
            <OptimizeDialog tripId={trip.id} itinerary={itinerary} />
            <TripActions tripId={trip.id} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <Tabs defaultValue="itinerary" className="print-clean min-w-0">
          <TabsList className="no-print mb-2 h-11 rounded-full bg-secondary p-1">
            {TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="rounded-full px-5 capitalize data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
                {t.trip.tabs[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="itinerary">
            {trip.startDate && (
              <Suspense fallback={<Skeleton className="mb-6 h-[68px] w-full rounded-xl" />}>
                <WeatherSection itinerary={itinerary} startDate={trip.startDate.toISOString()} />
              </Suspense>
            )}
            <ItineraryView itinerary={itinerary} interactive savedNames={savedNames} tripId={trip.id} />
          </TabsContent>
          <TabsContent value="map" className="no-print">
            <TripMap itinerary={itinerary} startDate={trip.startDate?.toISOString()} />
          </TabsContent>
          <TabsContent value="budget" className="no-print">
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
              <BudgetSection itinerary={itinerary} />
            </Suspense>
          </TabsContent>
          <TabsContent value="flights" className="no-print">
            <FlightTimeline tripId={trip.id} flights={flights} />
          </TabsContent>
          <TabsContent value="insights">
            <TripInsights itinerary={itinerary} interactive savedNames={savedNames} tripId={trip.id} packed={packed} />
          </TabsContent>
        </Tabs>

        <div className="no-print xl:sticky xl:top-28 xl:self-start">
          <ChatPanel tripId={trip.id} itinerary={itinerary} initialMessages={chatMessages} />
        </div>
      </div>
    </div>
  );
}
