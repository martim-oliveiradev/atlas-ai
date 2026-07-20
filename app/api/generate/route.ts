import { streamObject } from "ai";
import { auth } from "@/lib/auth";
import { itinerarySchema } from "@/lib/itinerary";
import { sampleItinerary } from "@/lib/sample-trip";
import { getModel, reportModelFailure } from "@/lib/ai-model";

export const maxDuration = 120;

const SYSTEM = `You are Atlas AI, an expert travel planner. From the traveler's free-form
description, extract budget, currency, destination, trip length, season, group size,
travel style (luxury, backpacking, family, couple, solo, business, adventure) and
interests, then produce a complete day-by-day itinerary.

Rules:
- Only real, currently operating places. Include lat/lng for every mappable spot.
- Respect the stated budget: totalCost must stay under it, budget categories must sum
  close to totalCost, and hotel picks must respect any nightly cap.
- Prices are realistic per-person estimates in the traveler's currency.
- Match interests concretely: name the specific district, shop, trail or dish, never
  generic filler like "explore the city".
- days must have exactly the requested trip length; include arrival and departure
  logistics on the first and last day.
- Write notes in a warm, specific voice, one sentence each.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { prompt } = await req.json();
  if (typeof prompt !== "string" || prompt.trim().length < 10) {
    return new Response("Describe your trip in a little more detail.", { status: 400 });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(JSON.stringify(sampleItinerary), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const result = streamObject({
    model: await getModel(),
    schema: itinerarySchema,
    system: SYSTEM,
    prompt,
    onError: () => reportModelFailure(),
  });
  return result.toTextStreamResponse();
}
