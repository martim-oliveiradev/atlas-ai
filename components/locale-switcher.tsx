"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import { useI18n } from "./i18n-provider";
import { cn } from "@/lib/utils";

export default function LocaleSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const { locale } = useI18n();

  const change = (next: string) => {
    if (next === locale) return;
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Interface language"
      className={cn("inline-flex items-center gap-1 rounded-full border bg-secondary/60 p-1", className)}
    >
      <Languages className="ml-1.5 mr-0.5 size-3.5 text-muted-foreground" aria-hidden />
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={locale === l}
          title={LOCALE_LABELS[l]}
          onClick={() => change(l)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium uppercase transition-colors",
            locale === l ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
