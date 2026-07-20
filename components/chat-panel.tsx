"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { chatResponseSchema, type Itinerary } from "@/lib/itinerary";
import { saveChatMessages, updateItinerary } from "@/lib/actions";
import { useI18n } from "@/components/i18n-provider";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPanel({
  tripId,
  itinerary,
  initialMessages,
}: {
  tripId: string;
  itinerary: Itinerary;
  initialMessages: Msg[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [applied, setApplied] = useState(false);
  const [, startTransition] = useTransition();
  const lastUserRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { object, submit, isLoading, error } = useObject({
    api: "/api/chat",
    schema: chatResponseSchema,
    onFinish({ object }) {
      if (!object) return;
      setMessages((prev) => [...prev, { role: "assistant", content: object.reply }]);
      startTransition(async () => {
        await saveChatMessages(tripId, lastUserRef.current, object.reply);
        if (object.itinerary) {
          await updateItinerary(tripId, object.itinerary);
          setApplied(true);
          router.refresh();
        }
      });
    },
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, object?.reply]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    lastUserRef.current = trimmed;
    setApplied(false);
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    submit({ messages: next, itinerary });
  };

  return (
    <Card className="flex h-[34rem] flex-col gap-0 overflow-hidden p-0">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 text-primary" />
          {t.chat.concierge}
        </p>
        {applied && (
          <Badge variant="secondary" className="rounded-full text-primary">
            {t.chat.updated}
          </Badge>
        )}
      </div>

      <div ref={scrollRef} className="grow space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !isLoading && (
          <div className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">{t.chat.empty}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
              m.role === "user" ? "ml-auto bg-primary/15 text-foreground" : "bg-secondary"
            )}
          >
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div className="max-w-[85%] rounded-xl bg-secondary px-3.5 py-2.5 text-sm leading-relaxed">
            {object?.reply || <span className="text-muted-foreground">{t.chat.thinking}</span>}
            {object?.itinerary && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                <Sparkles className="size-3" />
                {t.chat.rebuilding}
              </p>
            )}
          </div>
        )}
        {error && <p className="text-sm text-destructive">{t.chat.error}</p>}
      </div>

      {messages.length < 2 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2">
          {t.chat.suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 rounded-full border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chat.placeholder}
          aria-label={t.chat.messageAria}
          className="border-0 bg-secondary"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || isLoading} aria-label={t.chat.messageAria}>
          <ArrowUp className="size-4" />
        </Button>
      </form>
    </Card>
  );
}
