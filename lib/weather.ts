
export type DayWeather = {
  date: string;
  code: number;
  tMax: number;
  tMin: number;
  rain: number;
  wind: number;
  sunrise: string;
  sunset: string;
};

const FORECAST_DAYS = 16;

export function forecastWindow(startDate: Date, days: number): { start: string; end: string } | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setDate(max.getDate() + FORECAST_DAYS - 1);
  const start = startDate < today ? today : startDate;
  const tripEnd = new Date(startDate);
  tripEnd.setDate(tripEnd.getDate() + days - 1);
  const end = tripEnd > max ? max : tripEnd;
  if (start > end || tripEnd < today) return null;
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
}

export async function getForecast(lat: number, lng: number, start: string, end: string): Promise<DayWeather[] | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset` +
    `&timezone=auto&start_date=${start}&end_date=${end}`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const d = (await res.json()).daily;
    return (d.time as string[]).map((date: string, i: number) => ({
      date,
      code: d.weather_code[i],
      tMax: Math.round(d.temperature_2m_max[i]),
      tMin: Math.round(d.temperature_2m_min[i]),
      rain: d.precipitation_probability_max[i] ?? 0,
      wind: Math.round(d.wind_speed_10m_max[i]),
      sunrise: String(d.sunrise[i]).slice(11, 16),
      sunset: String(d.sunset[i]).slice(11, 16),
    }));
  } catch {
    return null;
  }
}

export function weatherKind(code: number): "sun" | "partly" | "cloud" | "fog" | "rain" | "snow" | "storm" {
  if (code === 0) return "sun";
  if (code <= 2) return "partly";
  if (code === 3) return "cloud";
  if (code <= 48) return "fog";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rain";
  if (code <= 77 || code === 85 || code === 86) return "snow";
  return "storm";
}
