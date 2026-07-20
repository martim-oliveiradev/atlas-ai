import { z } from "zod";

export const spotSchema = z.object({
  name: z.string(),
  note: z.string().describe("One sentence: what it is and why it fits this traveler."),
  cost: z.number().describe("Estimated cost per person in the trip currency. 0 if free."),
  lat: z.number().optional().describe("Latitude, if the place is a real mappable location."),
  lng: z.number().optional(),
});

export const daySchema = z.object({
  day: z.number(),
  title: z.string().describe("Short evocative day title, max 6 words."),
  area: z.string().describe("Neighborhood or town where the day happens."),
  breakfast: spotSchema,
  morning: spotSchema,
  lunch: spotSchema,
  afternoon: spotSchema,
  dinner: spotSchema,
  night: spotSchema,
  travel: z.string().describe("How to get around this day plus rough total transit time."),
  dailyCost: z.number().describe("Total estimated spend for the day, excluding hotel."),
  tip: z.string().describe("One insider tip specific to this day."),
});

export const itinerarySchema = z.object({
  title: z.string().describe("Trip title, max 6 words, no punctuation flourishes."),
  city: z.string().describe("Main city or region."),
  country: z.string(),
  summary: z.string().describe("Two sentences selling this exact trip to this traveler."),
  currency: z.string().describe("ISO currency code the traveler budgets in, e.g. EUR."),
  totalCost: z.number().describe("Estimated total trip cost including flights and hotels."),
  days: z.array(daySchema),
  budget: z
    .object({
      accommodation: z.number(),
      flights: z.number(),
      food: z.number(),
      transport: z.number(),
      activities: z.number(),
      shopping: z.number(),
      emergency: z.number().describe("Recommended emergency reserve."),
    })
    .describe("Whole-trip totals per category, in the trip currency."),
  hotels: z
    .array(
      z.object({
        name: z.string(),
        area: z.string(),
        pricePerNight: z.number(),
        style: z.string().describe("e.g. boutique, ryokan, design hotel, hostel"),
        note: z.string(),
      })
    )
    .describe("Three hotel picks matching the traveler's style and nightly cap."),
  packing: z.array(z.string()).describe("8 to 12 packing items specific to season and plans."),
  safety: z.array(z.string()).describe("3 to 5 practical safety notes."),
  weather: z.string().describe("What to expect this season, one or two sentences."),
  bestTime: z.string().describe("Best time of year to do this trip and why."),
  hiddenGems: z.array(z.object({ name: z.string(), note: z.string() })),
  photoSpots: z.array(z.object({ name: z.string(), note: z.string() })),
  rainPlan: z.array(z.string()).describe("Indoor alternatives if it rains."),
});

export type Spot = z.infer<typeof spotSchema>;
export type ItineraryDay = z.infer<typeof daySchema>;
export type Itinerary = z.infer<typeof itinerarySchema>;

export const optimizeResponseSchema = z.object({
  report: z.object({
    summary: z.string().describe("One sentence: what the optimization achieved overall."),
    timeSavedMinutes: z.number().describe("Total transit minutes saved vs the original plan. 0 if none."),
    costSaved: z.number().describe("Transport/activity cost saved in the trip currency. 0 if none."),
    efficiencyGain: z.number().describe("Overall efficiency improvement in percent, honest estimate."),
    changes: z.array(z.string()).describe("3 to 6 concrete changes made, one short sentence each."),
  }),
  itinerary: itinerarySchema.describe("The full optimized itinerary."),
});

export const chatResponseSchema = z.object({
  reply: z.string().describe("Short conversational answer to the traveler."),
  itinerary: itinerarySchema
    .optional()
    .describe("Full updated itinerary. Only when the traveler asked for a change."),
});

export const DAY_SLOTS = [
  ["breakfast", "Breakfast"],
  ["morning", "Morning"],
  ["lunch", "Lunch"],
  ["afternoon", "Afternoon"],
  ["dinner", "Dinner"],
  ["night", "Night"],
] as const;

export type SlotKey = (typeof DAY_SLOTS)[number][0];

export function parseItinerary(json: string | null): Itinerary | null {
  if (!json) return null;
  try {
    return itinerarySchema.parse(JSON.parse(json));
  } catch {
    return null;
  }
}

export function money(n: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
