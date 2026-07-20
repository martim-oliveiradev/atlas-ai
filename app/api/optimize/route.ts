import { streamObject } from "ai";
import { auth } from "@/lib/auth";
import { optimizeResponseSchema } from "@/lib/itinerary";
import { getModel, reportModelFailure } from "@/lib/ai-model";

export const maxDuration = 120;

const SYSTEM = `You are Atlas AI's trip optimizer. You receive a complete itinerary as JSON
and return a measurably better version of the SAME trip.

Optimize for:
- Less transit: group geographically close spots into the same day and order each
  day's stops to minimize backtracking (use the lat/lng provided).
- Better timing: popular attractions early morning or late afternoon to avoid peak
  crowds; respect typical opening hours (museums closed Mondays in many cities,
  markets are morning places, viewpoints at sunset).
- Meals near the activities around them, never across town.
- Lower transport cost where a walk or a single line replaces multiple rides.
- Keep the traveler's interests, budget, currency, trip length and every field of
  the schema. Keep lat/lng on mappable spots. Do not invent places.

Report honestly: if the plan is already tight, say so and keep changes small.
timeSavedMinutes and costSaved must be realistic estimates, not marketing numbers.
Write the report and itinerary in the same language as the input itinerary.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { itinerary } = await req.json();

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      JSON.stringify({
        report: {
          summary: "Demo mode: add GOOGLE_GENERATIVE_AI_API_KEY to .env to run the real optimizer.",
          timeSavedMinutes: 0,
          costSaved: 0,
          efficiencyGain: 0,
          changes: [],
        },
        itinerary,
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const result = streamObject({
    model: await getModel(),
    schema: optimizeResponseSchema,
    system: SYSTEM,
    prompt: `Optimize this itinerary:\n${JSON.stringify(itinerary)}`,
    onError: () => reportModelFailure(),
  });
  return result.toTextStreamResponse();
}
