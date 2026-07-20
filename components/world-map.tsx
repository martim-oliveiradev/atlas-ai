"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

export type MapPin = { lat: number; lng: number; title: string };

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export default function WorldMap({ pins }: { pins: MapPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true,
      }).setView([25, 10], 1.6);
      L.tileLayer(TILE_URL, { subdomains: "abcd", maxZoom: 10 }).addTo(map);
      pins.forEach((p) => {
        const icon = L.divIcon({
          className: "",
          html: `<div title="${p.title.replace(/"/g, "&quot;")}" style="width:12px;height:12px;border-radius:9999px;background:#e5a45c;border:2px solid #241a08;box-shadow:0 0 10px rgb(229 164 92/.6)"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        L.marker([p.lat, p.lng], { icon, title: p.title }).addTo(map);
      });
      if (pins.length > 1) map.fitBounds(pins.map((p) => [p.lat, p.lng] as [number, number]), { padding: [40, 40], maxZoom: 5 });
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 0);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [pins]);

  return <div ref={containerRef} className="z-0 h-72 w-full rounded-xl border bg-secondary" />;
}
