"use client";

import { useState, useTransition } from "react";
import { X, UtensilsCrossed, BedDouble, Compass, MapPin, Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toggleFavorite } from "@/lib/actions";
import { useI18n } from "@/components/i18n-provider";

export type SavedItem = { id: string; kind: string; name: string; place: string; note: string | null };

type Kind = "restaurant" | "hotel" | "activity" | "city" | "country";
const KIND_ICONS: Record<Kind, React.ComponentType<{ className?: string }>> = {
  restaurant: UtensilsCrossed,
  hotel: BedDouble,
  activity: Compass,
  city: MapPin,
  country: Globe2,
};
const KIND_ORDER: Kind[] = ["restaurant", "hotel", "activity", "city", "country"];

export default function SavedList({ items }: { items: SavedItem[] }) {
  const { t } = useI18n();
  const [list, setList] = useState(items);
  const [, startTransition] = useTransition();

  const remove = (item: SavedItem) => {
    setList((prev) => prev.filter((i) => i.id !== item.id));
    startTransition(() => {
      toggleFavorite({ kind: item.kind, name: item.name, place: item.place });
    });
  };

  const kinds = KIND_ORDER.filter((k) => list.some((i) => i.kind === k));

  return (
    <div className="space-y-10">
      {kinds.map((kind) => {
        const Icon = KIND_ICONS[kind];
        return (
          <section key={kind}>
            <h2 className="mb-4 flex items-center gap-2.5 text-lg font-medium">
              <Icon className="size-4 text-primary" />
              {t.saved.kinds[kind]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list
                .filter((i) => i.kind === kind)
                .map((item) => (
                  <Card key={item.id} className="group relative gap-1 p-5">
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      aria-label={`Remove ${item.name}`}
                      className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <X className="size-4" />
                    </button>
                    <h3 className="pr-8 font-medium leading-snug">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.place}</p>
                    {item.note && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.note}</p>}
                  </Card>
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
