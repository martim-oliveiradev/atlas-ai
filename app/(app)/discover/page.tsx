import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DiscoverGrid from "@/components/discover-grid";
import { getDict } from "@/lib/i18n-server";

export const metadata: Metadata = { title: "Discover" };

export default async function DiscoverPage() {
  const session = await auth();
  const [favorites, t] = await Promise.all([
    prisma.favorite.findMany({ where: { userId: session!.user.id, kind: "city" }, select: { name: true } }),
    getDict(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t.discover.title}</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">{t.discover.sub}</p>
      </div>
      <DiscoverGrid savedNames={favorites.map((f) => f.name)} />
    </div>
  );
}
