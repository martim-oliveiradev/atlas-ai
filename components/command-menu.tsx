"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Sparkles, Globe2, Heart, UserRound, LogOut } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { logout } from "@/lib/actions";
import { useI18n } from "./i18n-provider";

const PAGES = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "newTrip", href: "/new", icon: Sparkles },
  { key: "discover", href: "/discover", icon: Globe2 },
  { key: "saved", href: "/saved", icon: Heart },
  { key: "profile", href: "/profile", icon: UserRound },
] as const;

export default function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Atlas" description="Jump anywhere in Atlas">
      <CommandInput placeholder={t.nav.commandHint} />
      <CommandList>
        <CommandEmpty>{t.nav.nothingFound}</CommandEmpty>
        <CommandGroup heading={t.nav.goTo}>
          {PAGES.map((p) => (
            <CommandItem key={p.href} onSelect={() => go(p.href)}>
              <p.icon className="size-4" />
              {t.nav[p.key]}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t.nav.account}>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              logout();
            }}
          >
            <LogOut className="size-4" />
            {t.nav.signOut}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
