"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { Itinerary } from "@/lib/itinerary";
import type { Rates } from "@/lib/rates";

const BudgetCharts = dynamic(() => import("./budget-charts"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[86px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl lg:col-span-3" />
      </div>
    </div>
  ),
});

export default function BudgetChartsLazy(props: { itinerary: Itinerary; rates?: Rates | null }) {
  return <BudgetCharts {...props} />;
}
