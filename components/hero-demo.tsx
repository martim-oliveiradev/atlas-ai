"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, animate, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Loader2,
  Check,
  Sunrise,
  UtensilsCrossed,
  Wallet,
  Footprints,
  Sun,
  Plane,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "@/lib/itinerary";
import { sampleItinerary } from "@/lib/sample-trip";
import type { Dict } from "@/lib/i18n";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Phase = "typing" | "chips" | "generating" | "done";

function Counter({ to, active }: { to: number; active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) {
      setN(0);
      return;
    }
    const controls = animate(0, to, { duration: 1.1, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [active, to]);
  return <>{money(n, sampleItinerary.currency)}</>;
}

function Particles() {
  const seeds = [
    { left: "12%", top: "20%", d: 7, delay: 0 },
    { left: "82%", top: "14%", d: 9, delay: 1.2 },
    { left: "68%", top: "78%", d: 8, delay: 0.6 },
    { left: "24%", top: "72%", d: 10, delay: 1.8 },
    { left: "48%", top: "8%", d: 6, delay: 0.9 },
    { left: "92%", top: "52%", d: 11, delay: 0.3 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {seeds.map((p, i) => (
        <motion.span
          key={i}
          className="absolute size-1 rounded-full bg-primary/60 blur-[1px]"
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -14, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: p.d, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Floater({
  className,
  visible,
  delay = 0,
  float = 0,
  children,
}: {
  className?: string;
  visible: boolean;
  delay?: number;
  float?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={cn("glass absolute z-30 rounded-2xl px-3.5 py-2.5 shadow-xl shadow-black/40", className)}
      initial={false}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.96 }}
      transition={{ duration: 0.55, delay: visible ? delay : 0, ease: EASE }}
    >
      <motion.div animate={float ? { y: [0, float, 0] } : undefined} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function HeroDemo({ t }: { t: Dict }) {
  const reduce = useReducedMotion();
  const demo = t.landing.demo;
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const dest = demo.destination;
    setPhase("typing");
    setTyped("");
    setStep(0);

    let i = 0;
    const typeTimer = setInterval(() => {
      i += 1;
      setTyped(dest.slice(0, i));
      if (i >= dest.length) clearInterval(typeTimer);
    }, 95);

    const typeEnd = 500 + dest.length * 95;
    const genStart = typeEnd + 1100;
    const genEnd = genStart + 500 + 5 * 470;

    const timers = [
      setTimeout(() => setPhase("chips"), typeEnd + 350),
      setTimeout(() => setPhase("generating"), genStart),
      ...[0, 1, 2, 3, 4].map((sIdx) => setTimeout(() => setStep(sIdx + 1), genStart + 500 + sIdx * 470)),
      setTimeout(() => setPhase("done"), genEnd + 350),
      setTimeout(() => setCycle((c) => c + 1), genEnd + 350 + 4400),
    ];

    return () => {
      clearInterval(typeTimer);
      timers.forEach(clearTimeout);
    };
  }, [cycle, reduce, demo.destination]);

  const dest = demo.destination;
  const shownTyped = reduce ? dest : typed;
  const shownPhase: Phase = reduce ? "done" : phase;
  const shownStep = reduce ? 5 : step;
  const chipsVisible = shownPhase !== "typing";
  const generating = shownPhase === "generating";
  const done = shownPhase === "done";
  const typingCaret = shownPhase === "typing";

  const replay = () => {
    if (reduce) return;
    setCycle((c) => c + 1);
  };

  const chips = [demo.days, demo.spend, ...demo.interests];
  const day = sampleItinerary.days[1];
  const slots = [
    { icon: Sunrise, spot: day.morning },
    { icon: UtensilsCrossed, spot: day.lunch },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:max-w-none">
      <div className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-[2.5rem] bg-primary/15 blur-3xl" aria-hidden />
      {!reduce && <Particles />}

      <div className="relative rounded-[1.75rem] border bg-card/95 p-4 shadow-2xl shadow-black/50 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-primary/50" />
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="ml-1.5 text-xs font-medium text-muted-foreground">Atlas AI</span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full border bg-secondary/60 px-2 py-0.5 text-[10px] text-muted-foreground">
            <motion.span
              className="size-1.5 rounded-full bg-primary"
              animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            Live
          </span>
        </div>

        <p className="mb-2 text-xs text-muted-foreground">{demo.prompt}</p>
        <div className="flex items-center gap-2 rounded-2xl border bg-secondary/60 px-3 py-2.5">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <div className="grow truncate text-sm">
            <span className="font-medium">{shownTyped}</span>
            {typingCaret && (
              <motion.span
                className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-primary"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={replay}
            disabled={generating}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
              "bg-primary text-primary-foreground hover:shadow-[0_0_22px_-2px_var(--primary)]",
              "disabled:opacity-90 disabled:shadow-none"
            )}
          >
            {generating ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
            <span className="hidden sm:inline">{generating ? demo.generating : demo.generate}</span>
          </button>
        </div>

        <div className="mt-2.5 flex min-h-[26px] flex-wrap gap-1.5">
          <AnimatePresence>
            {chipsVisible &&
              chips.map((c, i) => (
                <motion.span
                  key={`${cycle}-${c}`}
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.08, ease: EASE }}
                  className="rounded-full border bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {c}
                </motion.span>
              ))}
          </AnimatePresence>
        </div>

        <div className="relative mt-4 min-h-[218px]">
          <AnimatePresence mode="wait">
            {generating && (
              <motion.div
                key="gen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3 pt-2"
              >
                <div className="h-1 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{ width: `${(shownStep / 5) * 100}%` }}
                    transition={{ ease: EASE, duration: 0.4 }}
                  />
                </div>
                {demo.steps.map((label, i) => {
                  const isDone = i < shownStep;
                  const isActive = i === shownStep;
                  return (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: isDone || isActive ? 1 : 0.4, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <span
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full border",
                          isDone ? "border-primary/40 bg-primary/15 text-primary" : "text-muted-foreground"
                        )}
                      >
                        {isDone ? (
                          <Check className="size-3" />
                        ) : isActive ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <span className="size-1.5 rounded-full bg-current opacity-40" />
                        )}
                      </span>
                      <span className={cn(isDone ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {done && (
              <motion.div
                key={`res-${cycle}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="grid gap-3 sm:grid-cols-2"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="rounded-xl border bg-secondary/40 p-3.5"
                >
                  <p className="mb-2.5 font-mono text-[11px] text-primary">{demo.dayLabel}</p>
                  <div className="space-y-2.5">
                    {slots.map((s, i) => (
                      <motion.div
                        key={s.spot.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + i * 0.12, ease: EASE }}
                        className="flex items-center gap-2.5"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-secondary">
                          <s.icon className="size-3.5 text-muted-foreground" />
                        </span>
                        <span className="min-w-0 grow truncate text-xs font-medium">{s.spot.name}</span>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {money(s.spot.cost, sampleItinerary.currency)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                  className="relative overflow-hidden rounded-xl border bg-[#12161f] p-3.5"
                >
                  <svg viewBox="0 0 160 120" className="absolute inset-0 h-full w-full opacity-90" aria-hidden>
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M20 0H0V20" fill="none" stroke="oklch(1 0 0 / 5%)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="160" height="120" fill="url(#grid)" />
                    <motion.path
                      d="M 24 92 Q 60 70 74 54 T 132 30"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="1.5"
                      strokeDasharray="4 5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
                    />
                    {[
                      [24, 92],
                      [74, 54],
                      [132, 30],
                    ].map(([cx, cy], i) => (
                      <motion.circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="3.5"
                        fill="var(--primary)"
                        stroke="#12161f"
                        strokeWidth="1.5"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.4 + i * 0.22 }}
                      />
                    ))}
                  </svg>
                  <span className="glass absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] text-muted-foreground">
                    <Footprints className="size-3 text-primary" />
                    {demo.onFoot}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
                  className="rounded-xl border bg-secondary/40 p-3.5 sm:col-span-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wallet className="size-3.5 text-primary" />
                      {demo.budgetLabel}
                    </span>
                    <span className="font-mono text-sm font-semibold">
                      <Counter to={sampleItinerary.totalCost} active={done} />
                    </span>
                  </div>
                  <div className="mt-2.5 flex h-1.5 gap-1 overflow-hidden rounded-full">
                    {[42, 24, 16, 10, 8].map((w, i) => (
                      <motion.span
                        key={i}
                        className={cn("h-full rounded-full", ["bg-primary", "bg-primary/70", "bg-primary/50", "bg-primary/35", "bg-primary/25"][i])}
                        initial={{ width: 0 }}
                        animate={{ width: `${w}%` }}
                        transition={{ duration: 0.6, delay: 0.35 + i * 0.06, ease: EASE }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {!generating && !done && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-2.5 pt-1"
              >
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-7 shrink-0 rounded-full bg-secondary/70" />
                    <div className="h-2.5 rounded-full bg-secondary/70" style={{ width: `${70 - i * 14}%` }} />
                  </div>
                ))}
                <div className="mt-4 h-16 rounded-xl bg-secondary/40" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Floater visible={done} delay={0.15} float={-6} className="-left-4 -top-5 sm:-left-8">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/15">
            <Wand2 className="size-3.5 text-primary" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-medium">{demo.optimized}</p>
            <p className="font-mono text-[10px] text-primary">{demo.efficiency}</p>
          </div>
        </div>
      </Floater>

      <Floater visible={done} delay={0.28} float={6} className="-right-3 -top-6 sm:-right-7">
        <div className="flex items-center gap-2.5">
          <Sun className="size-5 text-primary" />
          <div className="leading-tight">
            <p className="text-lg font-semibold">18°</p>
            <p className="text-[10px] text-muted-foreground">{demo.weatherSub}</p>
          </div>
        </div>
      </Floater>

      <Floater visible={done} delay={0.4} float={-5} className="-bottom-5 left-2 hidden sm:flex sm:-left-6">
        <div className="flex items-center gap-2 text-xs">
          <Plane className="size-4 rotate-45 text-primary" />
          <span className="font-medium">{demo.flight}</span>
        </div>
      </Floater>

      <Floater visible={done} delay={0.52} float={6} className="-bottom-4 right-2 hidden sm:flex sm:-right-6">
        <div className="flex items-center gap-2 text-xs">
          <Coins className="size-4 text-primary" />
          <span className="font-mono">{demo.currency}</span>
        </div>
      </Floater>
    </div>
  );
}
