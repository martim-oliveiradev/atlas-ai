import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseItinerary } from "@/lib/itinerary";
import { getDict } from "@/lib/i18n-server";
import { TripPdf } from "@/lib/trip-pdf";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const trip = await prisma.trip.findFirst({ where: { id, userId: session.user.id } });
  const itinerary = parseItinerary(trip?.itinerary ?? null);
  if (!trip || !itinerary) return new Response("Not found", { status: 404 });

  const t = await getDict();
  const buffer = await renderToBuffer(TripPdf({ itinerary, t }));

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${trip.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf"`,
    },
  });
}
