export type Destination = {
  name: string;
  country: string;
  region: string;
  tags: ("trending" | "beach" | "luxury" | "hidden" | "weekend" | "budget" | "nature" | "city")[];
  price: "€" | "€€" | "€€€";
  blurb: string;
  best: string;
  days: number;
};

export const FILTERS = [
  ["all", "All"],
  ["trending", "Trending"],
  ["beach", "Beach"],
  ["luxury", "Luxury"],
  ["hidden", "Hidden gems"],
  ["weekend", "Weekend"],
  ["budget", "Budget"],
  ["nature", "Nature"],
  ["city", "City breaks"],
] as const;

export const DESTINATIONS: Destination[] = [
  { name: "Kyoto", country: "Japan", region: "Asia", tags: ["trending", "city"], price: "€€", blurb: "Temple mornings, kaiseki dinners and the bamboo grove before the crowds wake up.", best: "Mar to May", days: 5 },
  { name: "Lisbon", country: "Portugal", region: "Europe", tags: ["trending", "weekend", "city"], price: "€€", blurb: "Tiled hills, pastel de nata for breakfast and fado drifting out of Alfama at night.", best: "Apr to Jun", days: 3 },
  { name: "Reykjavik", country: "Iceland", region: "Europe", tags: ["nature", "luxury"], price: "€€€", blurb: "Waterfalls, black beaches and the northern lights within an hour of the capital.", best: "Sep to Mar", days: 6 },
  { name: "Marrakesh", country: "Morocco", region: "Africa", tags: ["budget", "city"], price: "€", blurb: "Souk mazes, riad courtyards and tagine smoke over the Jemaa el-Fnaa at dusk.", best: "Oct to Apr", days: 4 },
  { name: "Amalfi Coast", country: "Italy", region: "Europe", tags: ["luxury", "beach"], price: "€€€", blurb: "Cliff roads, lemon groves and long lunches above impossibly blue water.", best: "May to Sep", days: 5 },
  { name: "Ubud", country: "Indonesia", region: "Asia", tags: ["budget", "nature"], price: "€", blurb: "Rice terraces, jungle pools and temple ceremonies you stumble into by accident.", best: "Apr to Oct", days: 7 },
  { name: "Mexico City", country: "Mexico", region: "Americas", tags: ["trending", "city", "budget"], price: "€", blurb: "World-class tacos, Frida's blue house and murals around every corner.", best: "Nov to Apr", days: 5 },
  { name: "Seoul", country: "South Korea", region: "Asia", tags: ["trending", "city"], price: "€€", blurb: "Palace courtyards by day, neon markets and barbecue smoke by night.", best: "Apr to Jun", days: 5 },
  { name: "The Azores", country: "Portugal", region: "Europe", tags: ["hidden", "nature"], price: "€€", blurb: "Volcanic lakes, whale season and hot springs in the middle of the Atlantic.", best: "Jun to Sep", days: 6 },
  { name: "Cape Town", country: "South Africa", region: "Africa", tags: ["nature", "luxury"], price: "€€", blurb: "Table Mountain sunrises, penguin beaches and winelands twenty minutes away.", best: "Nov to Mar", days: 7 },
  { name: "Ljubljana", country: "Slovenia", region: "Europe", tags: ["hidden", "weekend"], price: "€", blurb: "A fairy-tale riverfront capital with Lake Bled an easy day trip away.", best: "May to Sep", days: 3 },
  { name: "Tbilisi", country: "Georgia", region: "Asia", tags: ["hidden", "budget"], price: "€", blurb: "Sulfur baths, natural wine and supra feasts that outlast the evening.", best: "May to Oct", days: 4 },
  { name: "Monteverde", country: "Costa Rica", region: "Americas", tags: ["nature"], price: "€€", blurb: "Cloud forest canopies, hummingbirds and zip lines above the treetops.", best: "Dec to Apr", days: 6 },
  { name: "Copenhagen", country: "Denmark", region: "Europe", tags: ["weekend", "city", "luxury"], price: "€€€", blurb: "Harbor swims, bakery pilgrimages and the best-designed streets in Europe.", best: "May to Aug", days: 3 },
  { name: "Zanzibar", country: "Tanzania", region: "Africa", tags: ["beach", "hidden"], price: "€€", blurb: "Spice farms, Stone Town alleys and turquoise water that looks retouched.", best: "Jun to Oct", days: 6 },
  { name: "The Dolomites", country: "Italy", region: "Europe", tags: ["nature", "trending"], price: "€€", blurb: "Jagged peaks, rifugio lunches and alpine lakes glowing green at noon.", best: "Jun to Sep", days: 5 },
];

export function destinationPrompt(d: Destination) {
  return `Plan ${d.days} days in ${d.name}, ${d.country} for two people, ${
    d.price === "€" ? "on a tight budget" : d.price === "€€€" ? "with a generous budget" : "mid-range budget"
  }. We care about: ${d.blurb.toLowerCase()} Best season is ${d.best}.`;
}
