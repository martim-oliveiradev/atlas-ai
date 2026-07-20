"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register as registerAction } from "@/lib/actions";
import { useI18n } from "./i18n-provider";

type Values = { name?: string; email: string; password: string };

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { t } = useI18n();
  const [serverError, setServerError] = useState("");
  const [pending, startTransition] = useTransition();
  const schema = z.object({
    name: z.string().optional(),
    email: z.string().email(t.auth.invalidEmail),
    password: z.string().min(8, t.auth.shortPassword),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    setServerError("");
    if (mode === "signup" && (values.name ?? "").trim().length < 2) {
      setServerError(t.auth.tellName);
      return;
    }
    startTransition(async () => {
      const result =
        mode === "signup"
          ? await registerAction({ name: values.name!.trim(), email: values.email, password: values.password })
          : await login({ email: values.email, password: values.password });
      if (result?.error) setServerError(result.error);
    });
  });

  return (
    <Card className="w-full max-w-sm gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {mode === "signup" ? t.auth.signupTitle : t.auth.loginTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signup" ? t.auth.signupSub : t.auth.loginSub}
        </p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-4">
        {mode === "signup" && (
          <div className="grid gap-2">
            <Label htmlFor="name">{t.auth.name}</Label>
            <Input id="name" autoComplete="name" {...register("name")} className="bg-secondary" />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} className="bg-secondary" />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            {...register("password")}
            className="bg-secondary"
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <Button type="submit" disabled={pending} className="mt-2 rounded-full">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {mode === "signup" ? t.auth.createAccount : t.common.signIn}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            {t.auth.haveAccount}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t.common.signIn}
            </Link>
          </>
        ) : (
          <>
            {t.auth.newHere}{" "}
            <Link href="/signup" className="text-primary hover:underline">
              {t.auth.createOne}
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}
