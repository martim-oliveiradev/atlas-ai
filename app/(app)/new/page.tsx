import type { Metadata } from "next";
import TripComposer from "@/components/trip-composer";
import { getDict } from "@/lib/i18n-server";

export const metadata: Metadata = { title: "New trip" };

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: Promise<{ prefill?: string }>;
}) {
  const { prefill } = await searchParams;
  const t = await getDict();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t.composer.whereNext}</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">{t.composer.whereNextSub}</p>
      </div>
      <TripComposer prefill={prefill} />
    </div>
  );
}
