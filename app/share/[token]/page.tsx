import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Compass } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseItinerary, money } from "@/lib/itinerary";
import { Button } from "@/components/ui/button";
import ItineraryView from "@/components/itinerary-view";
import TripInsights from "@/components/trip-insights";
import { getDict } from "@/lib/i18n-server";
import { fill } from "@/lib/i18n";

export const metadata: Metadata = { title: "Shared trip" };

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trip = await prisma.trip.findUnique({
    where: { shareToken: token },
    include: { user: { select: { name: true } } },
  });
  const itinerary = parseItinerary(trip?.itinerary ?? null);
  if (!trip || !itinerary) notFound();
  const t = await getDict();

  return (
    <div className="min-h-dvh">
      <header className="fixed inset-x-0 top-4 z-40 px-4">
        <div className="glass mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full pl-5 pr-2.5">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Compass className="size-5 text-primary" />
            Atlas
          </Link>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href="/signup">{t.landing.planYourOwn}</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-28">
        <div className="mb-10">
          <p className="mb-2 text-sm text-muted-foreground">{fill(t.landing.shareBy, { name: trip.user.name })}</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{itinerary.title}</h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{itinerary.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              `${itinerary.city}, ${itinerary.country}`,
              fill(t.trip.days, { n: itinerary.days.length }),
              fill(t.trip.estimated, { amount: money(itinerary.totalCost, itinerary.currency) }),
            ].map((chip) => (
              <span key={chip} className="rounded-full border bg-secondary px-3.5 py-1.5 text-sm text-muted-foreground">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          <ItineraryView itinerary={itinerary} />
          <TripInsights itinerary={itinerary} />
        </div>

        <div className="mt-16 rounded-2xl border bg-card p-10 text-center">
          <h2 className="text-xl font-semibold tracking-tight">{t.landing.shareCtaTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">{t.landing.shareCtaSub}</p>
          <Button asChild className="mt-6 rounded-full px-8">
            <Link href="/signup">{t.landing.shareCtaBtn}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
