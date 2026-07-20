import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseItinerary } from "@/lib/itinerary";

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10).replaceAll("-", "");
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const trip = await prisma.trip.findFirst({ where: { id, userId: session.user.id } });
  const it = parseItinerary(trip?.itinerary ?? null);
  if (!trip || !it) return new Response("Not found", { status: 404 });

  const start = trip.startDate ?? new Date();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Atlas AI//Trip//EN",
    ...it.days.flatMap((d) => {
      const date = new Date(start);
      date.setDate(date.getDate() + d.day - 1);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      const desc = [
        `Breakfast: ${d.breakfast.name}`,
        `Morning: ${d.morning.name}`,
        `Lunch: ${d.lunch.name}`,
        `Afternoon: ${d.afternoon.name}`,
        `Dinner: ${d.dinner.name}`,
        `Night: ${d.night.name}`,
        `Tip: ${d.tip}`,
      ].join("\n");
      return [
        "BEGIN:VEVENT",
        `UID:${trip.id}-day${d.day}@atlas-ai`,
        `DTSTAMP:${fmtDate(new Date())}T000000Z`,
        `DTSTART;VALUE=DATE:${fmtDate(date)}`,
        `DTEND;VALUE=DATE:${fmtDate(next)}`,
        `SUMMARY:${esc(`${it.city} day ${d.day}: ${d.title}`)}`,
        `LOCATION:${esc(d.area)}`,
        `DESCRIPTION:${esc(desc)}`,
        "END:VEVENT",
      ];
    }),
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${trip.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics"`,
    },
  });
}
