import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { flightSchema } from "@/lib/flights";
import { FALLBACK_MODELS } from "@/lib/ai-model";

export const maxDuration = 120;

const importSchema = z.object({
  flights: z.array(flightSchema).describe("Every flight leg found in the document."),
  hotels: z.array(
    z.object({
      name: z.string(),
      area: z.string().describe("City or neighborhood"),
      checkIn: z.string().optional().describe("YYYY-MM-DD"),
      checkOut: z.string().optional(),
      pricePerNight: z.number().optional(),
      bookingRef: z.string().optional(),
    })
  ),
  passengers: z.array(z.string()).describe("Passenger names found, if any."),
  summary: z.string().describe("One sentence describing what was found."),
});

export type ImportResult = z.infer<typeof importSchema>;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ error: "Add GOOGLE_GENERATIVE_AI_API_KEY to .env to import documents." }, { status: 503 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.type !== "application/pdf") {
    return Response.json({ error: "Upload a PDF file." }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return Response.json({ error: "PDF too large (max 15 MB)." }, { status: 400 });
  }

  const fileBytes = new Uint8Array(await file.arrayBuffer());
  let lastError: unknown;
  for (const modelId of FALLBACK_MODELS) {
    try {
      const { object } = await generateObject({
        model: google(modelId),
        schema: importSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract every flight and hotel booking from this travel document. Use ISO 8601 with the local timezone offset for flight times (infer the offset from the airport's city). Leave arrays empty if nothing of that kind is present.",
              },
              { type: "file", data: fileBytes, mediaType: "application/pdf" },
            ],
          },
        ],
      });
      return Response.json(object);
    } catch (e) {
      lastError = e;
    }
  }
  return Response.json({ error: lastError instanceof Error ? lastError.message : "Extraction failed." }, { status: 500 });
}
