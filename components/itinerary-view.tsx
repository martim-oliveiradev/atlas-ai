"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Croissant,
  Sunrise,
  UtensilsCrossed,
  Compass,
  ChefHat,
  Moon,
  TramFront,
  Lightbulb,
  Heart,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { money, DAY_SLOTS, type Itinerary, type ItineraryDay, type SlotKey, type Spot } from "@/lib/itinerary";
import { toggleFavorite, updateItinerary } from "@/lib/actions";
import { useI18n, fill } from "@/components/i18n-provider";

const SLOT_ICONS: Record<SlotKey, React.ComponentType<{ className?: string }>> = {
  breakfast: Croissant,
  morning: Sunrise,
  lunch: UtensilsCrossed,
  afternoon: Compass,
  dinner: ChefHat,
  night: Moon,
};

const MEAL_SLOTS: SlotKey[] = ["breakfast", "lunch", "dinner"];

function SlotRow({
  slot,
  spot,
  currency,
  interactive,
  saved,
  onToggleSave,
  dragHandle,
}: {
  slot: SlotKey;
  spot: Spot;
  currency: string;
  interactive?: boolean;
  saved?: boolean;
  onToggleSave?: (spot: Spot, kind: string) => void;
  dragHandle?: React.ReactNode;
}) {
  const { t } = useI18n();
  const Icon = SLOT_ICONS[slot];
  const kind = MEAL_SLOTS.includes(slot) ? "restaurant" : "activity";

  return (
    <div className="group relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-secondary">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="w-px grow bg-border" />
      </div>
      <div className="min-w-0 grow pb-6">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{t.day[slot]}</p>
            <p className="truncate font-medium">{spot.name}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {dragHandle}
            {interactive && onToggleSave && (
              <button
                type="button"
                aria-label={saved ? `Remove ${spot.name} from saved` : `Save ${spot.name}`}
                onClick={() => onToggleSave(spot, kind)}
                className={cn(
                  "rounded-full p-1.5 transition-colors hover:bg-secondary",
                  saved ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                )}
              >
                <Heart className={cn("size-4", saved && "fill-current")} />
              </button>
            )}
            <span className="font-mono text-sm text-muted-foreground">
              {spot.cost > 0 ? money(spot.cost, currency) : t.day.free}
            </span>
          </div>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{spot.note}</p>
      </div>
    </div>
  );
}

function SortableSlot(props: {
  slot: SlotKey;
  spot: Spot;
  currency: string;
  interactive?: boolean;
  saved?: boolean;
  onToggleSave?: (spot: Spot, kind: string) => void;
  hint: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.slot });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "z-10 opacity-80")}
    >
      <SlotRow
        {...props}
        dragHandle={
          <button
            type="button"
            aria-label={props.hint}
            title={props.hint}
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none rounded-full p-1.5 text-muted-foreground opacity-0 transition-colors hover:bg-secondary group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        }
      />
    </div>
  );
}

export function DayCard({
  day,
  currency,
  interactive,
  place,
  savedNames,
  className,
  onDayChange,
}: {
  day: ItineraryDay;
  currency: string;
  interactive?: boolean;
  place?: string;
  savedNames?: string[];
  className?: string;
  onDayChange?: (day: ItineraryDay) => void;
}) {
  const { t } = useI18n();
  const [saved, setSaved] = useState(() => new Set(savedNames ?? []));
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSave = (spot: Spot, kind: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(spot.name)) next.delete(spot.name);
      else next.add(spot.name);
      return next;
    });
    startTransition(() => {
      toggleFavorite({ kind, name: spot.name, place: place ?? "", note: spot.note });
    });
  };

  const onSlotDragEnd = (e: DragEndEvent) => {
    if (!onDayChange || !e.over || e.active.id === e.over.id) return;
    const keys = DAY_SLOTS.map(([k]) => k);
    const from = keys.indexOf(e.active.id as SlotKey);
    const to = keys.indexOf(e.over.id as SlotKey);
    const contents = arrayMove(keys.map((k) => day[k]), from, to);
    const next = { ...day };
    keys.forEach((k, i) => (next[k] = contents[i]));
    onDayChange(next);
  };

  const rows = DAY_SLOTS.map(([slot]) => slot);
  const sortable = interactive && !!onDayChange;

  return (
    <Card className={cn("gap-0 p-6 sm:p-8", className)}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-mono text-sm text-primary">{fill(t.days, { n: day.day })}</p>
          <h3 className="text-xl font-semibold tracking-tight">{day.title}</h3>
        </div>
        <Badge variant="secondary" className="rounded-full font-normal">
          {day.area}
        </Badge>
      </div>
      <div>
        {sortable ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSlotDragEnd}>
            <SortableContext items={rows} strategy={verticalListSortingStrategy}>
              {rows.map((slot) => (
                <SortableSlot
                  key={slot}
                  slot={slot}
                  spot={day[slot]}
                  currency={currency}
                  interactive={interactive}
                  saved={saved.has(day[slot].name)}
                  onToggleSave={handleSave}
                  hint={t.dnd.hint}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          rows.map((slot) => (
            <SlotRow
              key={slot}
              slot={slot}
              spot={day[slot]}
              currency={currency}
              interactive={interactive}
              saved={saved.has(day[slot].name)}
              onToggleSave={interactive ? handleSave : undefined}
            />
          ))
        )}
      </div>
      <div className="space-y-3 border-t pt-5 text-sm">
        <p className="flex gap-3 text-muted-foreground">
          <TramFront className="mt-0.5 size-4 shrink-0" />
          <span>{day.travel}</span>
        </p>
        <p className="flex gap-3 text-muted-foreground">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{day.tip}</span>
        </p>
        <p className="flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground">{t.day.estSpend}</span>
          <span className="font-mono font-medium">{money(day.dailyCost, currency)}</span>
        </p>
      </div>
    </Card>
  );
}

function SortableDayChip({ day, active, onClick, label }: { day: number; active: boolean; onClick: () => void; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: day });
  return (
    <button
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "shrink-0 cursor-grab touch-none rounded-full border px-4 py-2 text-sm transition-colors active:cursor-grabbing",
        active ? "border-primary/40 bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground",
        isDragging && "z-10 opacity-80"
      )}
    >
      {label}
    </button>
  );
}

export default function ItineraryView({
  itinerary,
  interactive,
  savedNames,
  tripId,
}: {
  itinerary: Itinerary;
  interactive?: boolean;
  savedNames?: string[];
  tripId?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [days, setDays] = useState(itinerary.days);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => setDays(itinerary.days), [itinerary]);

  const editable = interactive && !!tripId;
  const day = days[active];
  const place = `${itinerary.city}, ${itinerary.country}`;

  const persist = (nextDays: ItineraryDay[]) => {
    setDays(nextDays);
    startTransition(async () => {
      await updateItinerary(tripId!, { ...itinerary, days: nextDays });
      toast.success(t.dnd.saved);
      router.refresh();
    });
  };

  const onDayDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = days.findIndex((d) => d.day === e.active.id);
    const to = days.findIndex((d) => d.day === e.over!.id);
    const moved = arrayMove(days, from, to).map((d, i) => ({ ...d, day: i + 1 }));
    if (active === from) setActive(to);
    persist(moved);
  };

  const onDayChange = (next: ItineraryDay) => {
    persist(days.map((d) => (d.day === next.day ? next : d)));
  };

  const chips = days.map((d, i) => (
    <SortableDayChip key={d.day} day={d.day} active={i === active} onClick={() => setActive(i)} label={fill(t.days, { n: d.day })} />
  ));

  return (
    <div>
      <div className="no-print mb-6 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Trip days">
        {editable ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDayDragEnd}>
            <SortableContext items={days.map((d) => d.day)} strategy={horizontalListSortingStrategy}>
              {chips}
            </SortableContext>
          </DndContext>
        ) : (
          days.map((d, i) => (
            <button
              key={d.day}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                i === active
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {fill(t.days, { n: d.day })}
            </button>
          ))
        )}
      </div>
      <div className="print:hidden">
        {day && (
          <DayCard
            key={day.day}
            day={day}
            currency={itinerary.currency}
            interactive={interactive}
            place={place}
            savedNames={savedNames}
            onDayChange={editable ? onDayChange : undefined}
          />
        )}
      </div>
      <div className="hidden space-y-6 print:block">
        {days.map((d) => (
          <DayCard key={d.day} day={d} currency={itinerary.currency} place={place} />
        ))}
      </div>
    </div>
  );
}
