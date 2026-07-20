"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, MotionConfig } from "framer-motion";
import {
  Compass,
  Sparkles,
  MessageCircle,
  Wallet,
  Map as MapIcon,
  CalendarDays,
  Camera,
  FileDown,
  Check,
  Footprints,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { money } from "@/lib/itinerary";
import { sampleItinerary, samplePrompt } from "@/lib/sample-trip";
import { DayCard } from "@/components/itinerary-view";
import HeroDemo from "@/components/hero-demo";
import { useI18n } from "@/components/i18n-provider";
import LocaleSwitcher from "@/components/locale-switcher";
import type { Dict } from "@/lib/i18n";

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Nav({ authed, t }: { authed: boolean; t: Dict }) {
  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4">
      <nav className="glass mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full pl-5 pr-2.5" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Compass className="size-5 text-primary" />
          Atlas
        </Link>
        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">{t.nav.features}</a>
          <a href="#sample" className="transition-colors hover:text-foreground">{t.nav.sampleTrip}</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">{t.nav.pricing}</a>
          <a href="#faq" className="transition-colors hover:text-foreground">{t.nav.faq}</a>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher className="mr-1 hidden sm:flex" />
          {authed ? (
            <Button asChild size="sm" className="rounded-full px-4">
              <Link href="/dashboard">{t.common.openApp}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4 text-muted-foreground hover:text-foreground">
                <Link href="/login">{t.common.signIn}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-4">
                <Link href="/signup">{t.common.startFree}</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

const STEP_ICONS = [Sparkles, CalendarDays, MessageCircle];
const TIER_FEATURED = [false, true, false];

export default function Landing({ authed }: { authed: boolean }) {
  const { t } = useI18n();
  const L = t.landing;
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh overflow-x-clip">
        <Nav authed={authed} t={t} />

        <section className="hero-glow relative">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
            aria-hidden
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-14 px-4 pb-16 pt-32 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-secondary/60 px-3.5 py-1.5 text-sm text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                {L.hero.badge}
              </p>
              <h1 className="max-w-xl text-balance text-4xl font-semibold leading-[1.03] tracking-tighter sm:text-5xl lg:text-6xl">
                {L.hero.title}
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{L.hero.sub}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-7 transition-shadow duration-300 hover:shadow-[0_0_32px_-6px_var(--primary)]"
                >
                  <Link href={authed ? "/new" : "/signup"}>{t.common.startFree}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-full border px-7 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-transparent hover:text-foreground"
                >
                  <a href="#sample">{L.hero.seeSample}</a>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="pb-4 lg:pl-6"
            >
              <HeroDemo t={t} />
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <Reveal>
              <div className="lg:sticky lg:top-32">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{L.how.title}</h2>
                <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">{L.how.sub}</p>
              </div>
            </Reveal>
            <div className="space-y-4">
              {L.steps.map((s, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <Reveal key={s.title} delay={i * 0.08}>
                    <Card className="flex-row items-start gap-5 p-6 sm:p-7">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-primary/10">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{s.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {s.body || `“${samplePrompt}”`}
                        </p>
                      </div>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <Reveal>
            <h2 className="max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">{L.features.heading}</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-6">
            <Reveal className="md:col-span-4">
              <Card className="h-full gap-4 p-7">
                <CalendarDays className="size-5 text-primary" />
                <h3 className="text-lg font-medium">{L.features.dayTitle}</h3>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{L.features.dayBody}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {L.features.dayChips.map((chip) => (
                    <span key={chip} className="rounded-full border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
                      {chip}
                    </span>
                  ))}
                </div>
              </Card>
            </Reveal>
            <Reveal delay={0.05} className="md:col-span-2">
              <Card className="h-full gap-4 bg-gradient-to-br from-primary/15 via-card to-card p-7">
                <Wallet className="size-5 text-primary" />
                <h3 className="text-lg font-medium">{L.features.budgetTitle}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{L.features.budgetBody}</p>
                <p className="mt-auto font-mono text-3xl font-semibold">
                  {money(sampleItinerary.totalCost, "EUR")}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">{L.features.budgetOf}</span>
                </p>
              </Card>
            </Reveal>
            <Reveal className="md:col-span-2">
              <Card className="h-full gap-4 p-7">
                <MapIcon className="size-5 text-primary" />
                <h3 className="text-lg font-medium">{L.features.mapTitle}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{L.features.mapBody}</p>
                <p className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
                  <Footprints className="size-4 text-primary" />
                  {L.features.mapFoot}
                </p>
              </Card>
            </Reveal>
            <Reveal delay={0.05} className="md:col-span-4">
              <Card className="h-full gap-5 p-7">
                <MessageCircle className="size-5 text-primary" />
                <h3 className="text-lg font-medium">{L.features.chatTitle}</h3>
                <div className="space-y-3">
                  <div className="ml-auto w-fit max-w-[80%] rounded-xl bg-primary/15 px-3.5 py-2.5 text-sm">{L.features.chatUser}</div>
                  <div className="w-fit max-w-[85%] rounded-xl bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground">{L.features.chatReply}</div>
                </div>
              </Card>
            </Reveal>
            <Reveal className="md:col-span-3">
              <Card className="relative h-full min-h-52 gap-4 overflow-hidden p-7">
                <Image
                  src="https://picsum.photos/seed/atlas-photography-travel/800/500"
                  alt="Travel photography"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                <div className="relative mt-auto">
                  <Camera className="mb-3 size-5 text-primary" />
                  <h3 className="text-lg font-medium text-white">{L.features.photoTitle}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{L.features.photoBody}</p>
                </div>
              </Card>
            </Reveal>
            <Reveal delay={0.05} className="md:col-span-3">
              <Card className="h-full gap-4 p-7">
                <FileDown className="size-5 text-primary" />
                <h3 className="text-lg font-medium">{L.features.exportTitle}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{L.features.exportBody}</p>
                <div className="mt-auto flex gap-2">
                  {L.features.exportChips.map((chip) => (
                    <span key={chip} className="rounded-full border bg-secondary px-3.5 py-1.5 text-xs text-muted-foreground">
                      {chip}
                    </span>
                  ))}
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        <section id="sample" className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">{L.sample.title}</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                {L.sample.prompt} <span className="text-foreground">&ldquo;{samplePrompt}&rdquo;</span>
              </p>
            </Reveal>
          </div>
          <Reveal className="mt-10">
            <div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-3">
              {sampleItinerary.days.slice(1, 4).map((d) => (
                <DayCard key={d.day} day={d} currency="EUR" className="h-full" />
              ))}
            </div>
            <div className="mx-auto mt-8 max-w-6xl px-4 text-center">
              <p className="text-muted-foreground">{L.sample.more}</p>
              <Button asChild className="mt-4 rounded-full px-6">
                <Link href={authed ? "/new" : "/signup"}>{t.common.startFree}</Link>
              </Button>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="grid gap-5 lg:grid-cols-5">
            {L.testimonials.items.map((item, i) => {
              const name = ["Mariana Costa", "Ingrid Solberg", "Devon Achebe"][i];
              const featured = i === 0;
              return (
                <Reveal key={name} delay={i * 0.07} className={cn(featured ? "lg:col-span-3" : "lg:col-span-2")}>
                  <Card className={cn("h-full justify-between gap-8 p-8", featured && "bg-gradient-to-br from-primary/10 via-card to-card")}>
                    <p className={cn("leading-relaxed", featured ? "text-xl tracking-tight sm:text-2xl" : "text-muted-foreground")}>
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border">
                        <AvatarFallback className="bg-secondary text-xs font-medium">
                          {name.split(" ").map((p) => p[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{item.role}</p>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">{L.pricing.title}</h2>
          </Reveal>
          <div className="mt-12 grid items-start gap-5 md:grid-cols-3">
            {L.pricing.tiers.map((tier, i) => {
              const featured = TIER_FEATURED[i];
              return (
                <Reveal key={tier.name} delay={i * 0.07}>
                  <Card className={cn("gap-6 p-8", featured && "border-primary/40 bg-gradient-to-b from-primary/10 to-card md:-mt-4 md:pb-12")}>
                    <div>
                      <h3 className="font-medium">{tier.name}</h3>
                      <p className="mt-3 text-4xl font-semibold tracking-tight">
                        {tier.price}
                        {tier.period && <span className="text-base font-normal text-muted-foreground">{tier.period}</span>}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{tier.blurb}</p>
                    </div>
                    <ul className="space-y-2.5">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant={featured ? "default" : "secondary"} className="rounded-full">
                      <Link href="/signup">{t.common.startFree}</Link>
                    </Button>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-2xl px-4 py-24 sm:py-32">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">{L.faq.title}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Accordion type="single" collapsible className="mt-10">
              {L.faq.items.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-base hover:no-underline">{f.q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-10 pt-8">
          <Reveal>
            <div className="hero-glow relative overflow-hidden rounded-3xl border p-12 text-center sm:p-20">
              <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">{L.finalCta}</h2>
              <Button asChild size="lg" className="mt-8 rounded-full px-9">
                <Link href={authed ? "/new" : "/signup"}>{t.common.startFree}</Link>
              </Button>
            </div>
          </Reveal>
          <footer className="flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Compass className="size-4 text-primary" />
              {L.footerTagline}
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#features" className="transition-colors hover:text-foreground">{t.nav.features}</a>
              <a href="#pricing" className="transition-colors hover:text-foreground">{t.nav.pricing}</a>
              <a href="#faq" className="transition-colors hover:text-foreground">{t.nav.faq}</a>
            </div>
          </footer>
        </section>
      </div>
    </MotionConfig>
  );
}
