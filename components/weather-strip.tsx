"use client";

import { Sun, CloudSun, Cloud, CloudFog, CloudRain, CloudSnow, CloudLightning, Droplets } from "lucide-react";
import { weatherKind, type DayWeather } from "@/lib/weather";
import { useI18n, fill } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

const ICONS = {
  sun: Sun,
  partly: CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
} as const;

export default function WeatherStrip({ forecast, startDate }: { forecast: DayWeather[]; startDate: string }) {
  const { t } = useI18n();
  const start = new Date(startDate);
  const dayNumber = (date: string) => Math.round((new Date(date).getTime() - start.getTime()) / 86400000) + 1;
  const rainy = forecast.find((d) => d.rain >= 50);

  return (
    <div className="no-print mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {forecast.map((d) => {
          const Icon = ICONS[weatherKind(d.code)];
          const wet = d.rain >= 50;
          return (
            <div
              key={d.date}
              title={`${fill(t.weather.wind, { n: d.wind })} · ${fill(t.weather.sun, { rise: d.sunrise, set: d.sunset })}`}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl border bg-secondary/50 px-3.5 py-2.5",
                wet && "border-primary/40"
              )}
            >
              <Icon className={cn("size-5", wet ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="font-mono text-xs text-muted-foreground">{fill(t.days, { n: dayNumber(d.date) })}</p>
                <p className="text-sm">
                  <span className="font-medium">{d.tMax}°</span>
                  <span className="text-muted-foreground"> / {d.tMin}°</span>
                  <span className={cn("ml-2 text-xs", wet ? "text-primary" : "text-muted-foreground")}>
                    <Droplets className="mr-0.5 inline size-3" />
                    {d.rain}%
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {rainy && (
        <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <CloudRain className="size-3.5 text-primary" />
          {fill(t.weather.rainHint, { n: dayNumber(rainy.date) })}
        </p>
      )}
    </div>
  );
}
