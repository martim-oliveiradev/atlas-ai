import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProfileForm from "@/components/profile-form";
import { getDict, getLocale } from "@/lib/i18n-server";
import { fill } from "@/lib/i18n";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  const [user, t, locale] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session!.user.id },
      include: { _count: { select: { trips: true, favorites: true } } },
    }),
    getDict(),
    getLocale(),
  ]);
  if (!user) return null;

  let prefs: Record<string, string> = {};
  try {
    prefs = user.prefs ? JSON.parse(user.prefs) : {};
  } catch {}

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const memberSince = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(user.createdAt);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5">
        <Avatar className="size-16 border">
          <AvatarFallback className="bg-primary/15 text-lg font-medium text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{user.name}</h1>
          <p className="mt-0.5 text-muted-foreground">
            {user.email} · {fill(t.profile.memberSince, { date: memberSince })} · {fill(t.profile.tripsCount, { n: user._count.trips })} ·{" "}
            {fill(t.profile.savedCount, { n: user._count.favorites })}
          </p>
        </div>
      </div>
      <ProfileForm name={user.name} prefs={prefs} />
    </div>
  );
}
