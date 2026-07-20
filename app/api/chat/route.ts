import { streamObject } from "ai";
import { auth } from "@/lib/auth";
import { chatResponseSchema } from "@/lib/itinerary";
import { getModel, reportModelFailure } from "@/lib/ai-model";

export const maxDuration = 120;

const SYSTEM = `You are Atlas AI, a travel concierge chatting about one specific trip.
You receive the current itinerary as JSON plus the conversation.

- Questions (weather, prices, what to wear, is X worth it): answer in "reply" only.
- Change requests (move an activity, find cheaper hotels, replace museums, add
  nightlife, make a luxury / backpacking / family version): return the COMPLETE
  updated itinerary in "itinerary" following the same schema, keeping everything the
  traveler did not ask to change identical, and summarize what changed in "reply".
- Keep the same currency, keep prices realistic, keep lat/lng on mappable spots.
- Write your "reply" and all itinerary content in the same language as the current
  itinerary you were given (match its titles and notes). Never switch language.
- "reply" is short and conversational, max three sentences.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { messages, itinerary } = await req.json();

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      JSON.stringify({
        reply:
          "I am running in demo mode without a Gemini key, so I cannot edit this trip. Add GOOGLE_GENERATIVE_AI_API_KEY to .env and I will move activities, swap hotels and rebuild whole days for you.",
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const result = streamObject({
    model: await getModel(),
    schema: chatResponseSchema,
    system: SYSTEM,
    prompt: `Current itinerary:\n${JSON.stringify(itinerary)}\n\nConversation:\n${(messages as { role: string; content: string }[])
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n")}`,
    onError: () => reportModelFailure(),
  });
  return result.toTextStreamResponse();
}
