"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Layer } from "leaflet";
import { Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAY_SLOTS, type Itinerary } from "@/lib/itinerary";
import { useI18n, fill } from "@/components/i18n-provider";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR = "&copy; OpenStreetMap &copy; CARTO";

type Stop = { name: string; label: string; lat: number; lng: number };
type RouteInfo = { km: number; min: number; real: boolean };

function dayStops(it: Itinerary, dayIndex: number): Stop[] {
  const day = it.days[dayIndex];
  if (!day) return [];
  return DAY_SLOTS.flatMap(([slot, label]) => {
    const s = day[slot];
    return s.lat != null && s.lng != null ? [{ name: s.name, label, lat: s.lat, lng: s.lng }] : [];
  });
}

function straightLine(stops: Stop[]): { km: number; min: number } {
  let km = 0;
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    km += 6371 * 2 * Math.asin(Math.sqrt(h));
  }
  return { km, min: Math.round(km * 12) };
}

async function osrmRoute(stops: Stop[]): Promise<{ path: [number, number][]; km: number; min: number } | null> {
  if (stops.length < 2) return null;
  try {
    const coords = stops.map((s) => `${s.lng},${s.lat}`).join(";");
    const res = await fetch(`https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`);
    if (!res.ok) return null;
    const route = (await res.json()).routes?.[0];
    if (!route?.geometry?.coordinates?.length) return null;
    return {
      path: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]),
      km: route.distance / 1000,
      min: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

export default function TripMap({ itinerary, startDate }: { itinerary: Itinerary; startDate?: string | null }) {
  const { t } = useI18n();
  const [active, setActive] = useState(() => {
    if (!startDate) return 0;
    const diff = Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000);
    return diff >= 0 && diff < itinerary.days.length ? diff : 0;
  });
  const [ready, setReady] = useState(false);
  const [info, setInfo] = useState<RouteInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layersRef = useRef<Layer[]>([]);
  const stops = dayStops(itinerary, active);
  const day = itinerary.days[active];

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      const first = dayStops(itinerary, 0);
      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
        first.length ? [first[0].lat, first[0].lng] : [35.68, 139.7],
        12
      );
      L.tileLayer(TILE_URL, { subdomains: "abcd", maxZoom: 20, attribution: TILE_ATTR }).addTo(map);
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 0);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      setReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [itinerary]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      const straight = stops.map((s) => [s.lat, s.lng] as [number, number]);
      const est = straightLine(stops);
      const real = await osrmRoute(stops);
      if (cancelled) return;

      layersRef.current.forEach((l) => l.remove());
      layersRef.current = [];
      setInfo(stops.length > 1 ? (real ? { km: real.km, min: real.min, real: true } : { ...est, real: false }) : null);
      if (!stops.length) return;

      layersRef.current.push(
        L.polyline(real?.path ?? straight, {
          color: "#e5a45c",
          weight: 2.5,
          opacity: 0.9,
          className: "animate-dash",
          dashArray: "6 10",
        }).addTo(map)
      );
      stops.forEach((s, i) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:26px;height:26px;border-radius:9999px;background:#e5a45c;color:#241a08;display:flex;align-items:center;justify-content:center;font:600 12px/1 var(--font-geist-mono),monospace;border:2px solid #241a08;box-shadow:0 2px 8px rgb(0 0 0/.5)">${i + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        layersRef.current.push(L.marker([s.lat, s.lng], { icon, title: `${s.label}: ${s.name}` }).addTo(map));
      });
      map.fitBounds(straight, { padding: [56, 56], maxZoom: 14 });
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, active, stops.length, itinerary]);

  return (
    <div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Map days">
        {itinerary.days.map((d, i) => (
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
        ))}
      </div>

      <div className="relative overflow-hidden rounded-xl border">
        <div ref={containerRef} className="z-0 h-[32rem] w-full bg-secondary" />
        <div className="glass pointer-events-none absolute bottom-4 left-4 z-[400] max-w-xs rounded-xl p-4">
          <p className="mb-2 text-sm font-medium">{day?.title}</p>
          <ol className="space-y-1.5 text-sm text-muted-foreground">
            {stops.map((s, i) => (
              <li key={`${s.name}-${i}`} className="flex gap-2">
                <span className="font-mono text-primary">{i + 1}</span>
                <span className="truncate">{s.name}</span>
              </li>
            ))}
          </ol>
          {info && (
            <p className="mt-3 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
              <Footprints className="size-3.5" />
              {fill(t.map.onFoot, { n: info.min })} · {info.km.toFixed(1)} km
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
