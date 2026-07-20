"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/lib/actions";
import { useI18n } from "@/components/i18n-provider";

const schema = z.object({
  name: z.string().min(2, "Your name needs at least 2 characters"),
  home: z.string().optional().default(""),
  style: z.string().optional().default(""),
  food: z.string().optional().default(""),
  languages: z.string().optional().default(""),
  dreams: z.string().optional().default(""),
  passport: z.string().optional().default(""),
});

type Values = z.infer<typeof schema>;

const FIELD_KEYS = ["home", "style", "food", "languages", "passport"] as const;
const FIELD_PLACEHOLDERS: Record<(typeof FIELD_KEYS)[number], string> = {
  home: "Lisbon, Portugal",
  style: "Boutique hotels, slow mornings, street food",
  food: "Sushi, natural wine, anything spicy",
  languages: "Portuguese, English, some Japanese",
  passport: "Portugal",
};

export default function ProfileForm({ name, prefs }: { name: string; prefs: Partial<Values> }) {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name, ...prefs },
  });

  const onSubmit = handleSubmit((values) => {
    setSaved(false);
    startTransition(async () => {
      const { name: newName, ...rest } = values;
      await updateProfile({ name: newName, prefs: rest });
      setSaved(true);
    });
  });

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">{t.profile.name}</Label>
          <Input id="name" {...register("name")} className="bg-secondary" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        {FIELD_KEYS.map((key) => (
          <div key={key} className="grid gap-2">
            <Label htmlFor={key}>{t.profile.fields[key]}</Label>
            <Input id={key} placeholder={FIELD_PLACEHOLDERS[key]} {...register(key)} className="bg-secondary" />
            <p className="text-xs text-muted-foreground">{t.profile.help[key]}</p>
          </div>
        ))}
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="dreams">{t.profile.dreams}</Label>
          <Textarea
            id="dreams"
            rows={3}
            placeholder={t.profile.dreamsPlaceholder}
            {...register("dreams")}
            className="resize-none bg-secondary"
          />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={pending} className="rounded-full px-6">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {t.profile.save}
          </Button>
          {saved && !pending && <span className="text-sm text-primary">{t.profile.saved}</span>}
        </div>
      </form>
    </Card>
  );
}
