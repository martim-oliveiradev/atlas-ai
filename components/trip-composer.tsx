"use client";

import { useEffect, useState, useTransition } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Sparkles, Loader2, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { daySchema, itinerarySchema, money, type Itinerary } from "@/lib/itinerary";
import { saveTrip } from "@/lib/actions";
import { samplePrompt } from "@/lib/sample-trip";
import { DayCard } from "@/components/itinerary-view";
import { useI18n, fill } from "@/components/i18n-provider";

const STYLES = ["balanced", "luxury", "backpacking", "family", "couple", "adventure"] as const;

const LANGUAGES = [
  ["en", "English"],
  ["pt", "Português"],
  ["es", "Español"],
  ["fr", "Français"],
  ["it", "Italiano"],
  ["de", "Deutsch"],
  ["nl", "Nederlands"],
  ["ja", "日本語"],
] as const;

const EXAMPLES = [
  samplePrompt,
  "Long weekend in Lisbon for two, 600 euro budget, we care about food, viewpoints and fado bars.",
  "10 days in Peru in June, solo, mid-range budget of $2500, hiking and ruins, I want Machu Picchu without the crowds.",
  "Family of four, one week in the Azores in August, 3000 euros, nature, whales, easy hikes with kids aged 6 and 9.",
];

export default function TripComposer({ prefill }: { prefill?: string }) {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState(prefill ?? "");
  const [style, setStyle] = useState<(typeof STYLES)[number]>("balanced");
  const [language, setLanguage] = useState("en");
  const [startDate, setStartDate] = useState("");
  const [result, setResult] = useState<Itinerary | null>(null);
  const [saving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const nav = navigator.language.slice(0, 2).toLowerCase();
    if (LANGUAGES.some(([code]) => code === nav)) setLanguage(nav);
  }, []);

  const { object, submit, isLoading, error } = useObject({
    api: "/api/generate",
    schema: itinerarySchema,
    onFinish({ object }) {
      if (object) setResult(object);
    },
  });

  const generate = () => {
    if (prompt.trim().length < 10 || isLoading) return;
    setResult(null);
    const langName = LANGUAGES.find(([code]) => code === language)?.[1] ?? "English";
    const parts = [prompt.trim()];
    if (style !== "balanced") parts.push(`Travel style: ${style}.`);
    if (startDate) parts.push(`Trip starts on ${startDate}.`);
    parts.push(
      `Write the entire plan — every title, summary, note, tip and list item — in ${langName}, using correct spelling and accents/diacritics. Keep currency codes and real place names in their natural form.`
    );
    submit({ prompt: parts.join(" ") });
  };

  const save = () => {
    if (!result) return;
    setSaveError("");
    startSaving(async () => {
      const res = await saveTrip(result, { startDate: startDate || undefined, style });
      if (res?.error) setSaveError(res.error);
    });
  };

  const preview = result ?? object;
  const showPreview = isLoading || result;

  return (
    <div className="space-y-8">
      <Card className="gap-5 p-6 sm:p-8">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.composer.placeholder}
          aria-label={t.composer.describeAria}
          rows={4}
          autoFocus
          className="min-h-28 resize-none border-0 bg-secondary text-base leading-relaxed"
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t.composer.styles.balanced}>
            {STYLES.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={style === s}
                onClick={() => setStyle(s)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  style === s ? "border-primary/40 bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {t.composer.styles[s]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            {t.composer.language}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Itinerary language"
              className="rounded-lg border bg-secondary px-3 py-1.5 text-sm text-foreground [color-scheme:dark]"
            >
              {LANGUAGES.map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            {t.composer.starts}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border bg-secondary px-3 py-1.5 text-sm text-foreground [color-scheme:dark]"
            />
          </label>
          <Button onClick={generate} disabled={prompt.trim().length < 10 || isLoading} className="ml-auto rounded-full px-6">
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {isLoading ? t.composer.planning : t.composer.planMyTrip}
          </Button>
        </div>
        {!showPreview && (
          <div className="border-t pt-5">
            <p className="mb-3 text-sm text-muted-foreground">{t.composer.orExample}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {EXAMPLES.map((e) => (
                <button
                  key={e}
                  onClick={() => setPrompt(e)}
                  className="rounded-xl border bg-secondary/50 p-3.5 text-left text-sm leading-relaxed text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive">
            {fill(t.composer.snag, { msg: error.message || t.composer.tryAgain })}
          </p>
        )}
      </Card>

      {showPreview && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              {preview?.title ? (
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{preview.title}</h2>
              ) : (
                <Skeleton className="h-9 w-64" />
              )}
              {preview?.summary ? (
                <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{preview.summary}</p>
              ) : (
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-96 max-w-full" />
                  <Skeleton className="h-4 w-80 max-w-full" />
                </div>
              )}
            </div>
            {result ? (
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={generate} className="rounded-full">
                    <RotateCcw className="size-4" />
                    {t.composer.regenerate}
                  </Button>
                  <Button onClick={save} disabled={saving || !!saveError} className="rounded-full px-6">
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    {t.composer.saveTrip}
                  </Button>
                </div>
                {saveError && (
                  <p className="max-w-xs text-right text-sm text-destructive">
                    {saveError.startsWith("limit:") ? fill(t.composer.limitReached, { n: saveError.split(":")[1] }) : saveError}
                  </p>
                )}
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="size-4 animate-spin" />
                {fill(t.composer.writingDay, { n: (object?.days?.length ?? 0) + 1 })}
              </p>
            )}
          </div>

          {preview?.totalCost != null && (
            <div className="flex flex-wrap gap-2">
              {[
                fill(t.composer.days, { n: preview.days?.length ?? "…" }),
                `${preview.city ?? "…"}, ${preview.country ?? ""}`,
                fill(t.composer.estimated, { amount: money(preview.totalCost, preview.currency ?? "EUR") }),
              ].map((chip) => (
                <span key={chip} className="rounded-full border bg-secondary px-3.5 py-1.5 text-sm text-muted-foreground">
                  {chip}
                </span>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {(preview?.days ?? []).map((d, i) =>
              daySchema.safeParse(d).success ? (
                <DayCard
                  key={i}
                  day={d as Itinerary["days"][number]}
                  currency={preview?.currency ?? "EUR"}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                />
              ) : (
                <Card key={i} className="gap-3 p-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </Card>
              )
            )}
            {isLoading && (object?.days?.length ?? 0) === 0 && (
              <>
                <Card className="gap-3 p-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
                <Card className="gap-3 p-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
