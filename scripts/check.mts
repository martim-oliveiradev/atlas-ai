import assert from "node:assert";
import { itinerarySchema } from "../lib/itinerary.ts";
import { sampleItinerary } from "../lib/sample-trip.ts";

const it = itinerarySchema.parse(sampleItinerary);

assert.equal(it.days.length, 12, "sample trip is 12 days");
assert.ok(
  it.days.every((d, i) => d.day === i + 1),
  "days are numbered 1..n in order"
);

const categories = Object.values(it.budget).reduce((a, b) => a + b, 0);
assert.ok(
  Math.abs(categories - it.totalCost) <= it.totalCost * 0.05,
  `budget categories (${categories}) sum close to totalCost (${it.totalCost})`
);

const mappable = it.days.flatMap((d) =>
  [d.breakfast, d.morning, d.lunch, d.afternoon, d.dinner, d.night].filter((s) => s.lat != null)
);
assert.ok(mappable.length > 30, "enough mappable stops for the map view");
assert.ok(
  mappable.every((s) => s.lat! > 20 && s.lat! < 46 && s.lng! > 122 && s.lng! < 146),
  "all sample coordinates are inside Japan"
);

console.log("check passed: sample itinerary valid,", it.days.length, "days,", mappable.length, "mapped stops");
