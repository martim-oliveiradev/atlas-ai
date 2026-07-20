import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SavedList from "@/components/saved-list";
import { getDict } from "@/lib/i18n-server";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const session = await auth();
  const [items, t] = await Promise.all([
    prisma.favorite.findMany({ where: { userId: session!.user.id }, orderBy: { createdAt: "desc" } }),
    getDict(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t.saved.title}</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">{t.saved.sub}</p>
      </div>
      {items.length === 0 ? (
        <Card className="items-center gap-4 p-12 text-center">
          <Heart className="size-8 text-primary" />
          <div>
            <h2 className="text-lg font-medium">{t.saved.noneTitle}</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{t.saved.noneSub}</p>
          </div>
          <Button asChild variant="secondary" className="rounded-full px-6">
            <Link href="/discover">{t.saved.browse}</Link>
          </Button>
        </Card>
      ) : (
        <SavedList items={items} />
      )}
    </div>
  );
}
