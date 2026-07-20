"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LayoutDashboard, Sparkles, Globe2, Heart, Command as CommandIcon, LogOut, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions";
import { useI18n } from "./i18n-provider";
import LocaleSwitcher from "./locale-switcher";
import CommandMenu from "./command-menu";

const LINKS = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "newTrip", href: "/new", icon: Sparkles },
  { key: "discover", href: "/discover", icon: Globe2 },
  { key: "saved", href: "/saved", icon: Heart },
] as const;

export default function AppNav({ user }: { user: { name?: string | null; email?: string | null } }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [cmdOpen, setCmdOpen] = useState(false);
  const initials = (user.name ?? "A")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="no-print fixed inset-x-0 top-4 z-40 px-4">
      <nav className="glass mx-auto flex h-14 max-w-4xl items-center gap-1 rounded-full pl-5 pr-2.5" aria-label="Main">
        <Link href="/dashboard" className="mr-2 flex items-center gap-2 font-semibold tracking-tight">
          <Compass className="size-5 text-primary" />
          <span className="hidden sm:inline">Atlas</span>
        </Link>
        <div className="flex grow items-center gap-1">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-colors",
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <l.icon className="size-4" />
                <span className="hidden md:inline">{t.nav[l.key]}</span>
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => setCmdOpen(true)}
          className="mr-1 hidden items-center gap-2 rounded-full border bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex"
          aria-label={t.nav.commandHint}
        >
          <CommandIcon className="size-3.5" />
          <span className="font-mono">K</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu">
            <Avatar className="size-9 border">
              <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <LocaleSwitcher />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserRound className="size-4" />
                {t.nav.profile}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => logout()}>
              <LogOut className="size-4" />
              {t.nav.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
    </header>
  );
}
