import { z } from "zod";

export const flightSchema = z.object({
  from: z.string().describe("Departure IATA code, e.g. LIS"),
  fromCity: z.string(),
  to: z.string().describe("Arrival IATA code"),
  toCity: z.string(),
  departure: z.string().describe("Departure local time, ISO 8601 with timezone offset"),
  arrival: z.string().describe("Arrival local time, ISO 8601 with timezone offset"),
  airline: z.string(),
  flightNumber: z.string(),
  terminal: z.string().optional(),
  gate: z.string().optional(),
  baggage: z.string().optional().describe("e.g. 1x23kg checked"),
  bookingRef: z.string().optional(),
});

export type Flight = z.infer<typeof flightSchema>;

export function parseFlights(json: string | null): Flight[] {
  if (!json) return [];
  try {
    return z.array(flightSchema).parse(JSON.parse(json));
  } catch {
    return [];
  }
}

export function minutesBetween(aIso: string, bIso: string) {
  return Math.round((new Date(bIso).getTime() - new Date(aIso).getTime()) / 60000);
}

export function fmtDuration(min: number) {
  const h = Math.floor(Math.abs(min) / 60);
  const m = Math.abs(min) % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function tzOffset(iso: string): string | null {
  const m = iso.match(/([+-]\d{2}:?\d{2}|Z)$/);
  if (!m) return null;
  return m[1] === "Z" ? "+00:00" : m[1];
}

export function localTime(iso: string) {
  const m = iso.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : iso;
}

export function localDate(iso: string) {
  return iso.slice(0, 10);
}

export function mergeFlights(existing: Flight[], incoming: Flight[]): Flight[] {
  const key = (f: Flight) => `${f.flightNumber}|${f.departure}`;
  const seen = new Set(existing.map(key));
  const merged = [...existing, ...incoming.filter((f) => !seen.has(key(f)))];
  return merged.sort((a, b) => a.departure.localeCompare(b.departure));
}
