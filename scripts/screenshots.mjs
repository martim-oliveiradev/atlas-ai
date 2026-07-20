import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
const EMAIL = process.env.SHOT_EMAIL ?? "martim@atlas.app";
const PASSWORD = process.env.SHOT_PASSWORD ?? "atlas-neon-2026";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
  reducedMotion: "reduce",
});
const page = await context.newPage();

const shot = async (name, opts = {}) => {
  await page.screenshot({ path: `${OUT}/${name}.png`, ...opts });
  console.log("saved", name);
};
const settle = (ms = 1200) => page.waitForTimeout(ms);

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await settle(1500);
await shot("hero");
try {
  await page.locator("#features").scrollIntoViewIfNeeded();
  await settle(800);
  await page.locator("#features").screenshot({ path: `${OUT}/features.png` });
  console.log("saved features");
} catch (e) {
  console.log("features shot skipped:", e.message);
}

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill("#email", EMAIL);
await page.fill("#password", PASSWORD);
await page.click('button[type=submit]');
await page.waitForURL("**/dashboard", { timeout: 25000 }).catch(() => {});
await page.waitForSelector('a[href^="/trips/"]', { timeout: 20000 });
await settle(2800);
await shot("dashboard");

const links = await page.locator('a[href^="/trips/"]').evaluateAll((els) =>
  els.map((e) => ({ href: e.getAttribute("href"), text: e.textContent || "" }))
);
const japan = links.find((l) => /japan/i.test(l.text)) ?? links[0];

if (japan) {
  await page.goto(`${BASE}${japan.href}`, { waitUntil: "networkidle" });
  await page.waitForSelector("h1", { timeout: 15000 });
  await settle(2500);
  await shot("trip-itinerary");

  const clickTab = async (name) => {
    const tab = page.getByRole("tab", { name });
    if (await tab.count()) {
      await tab.first().click();
      return true;
    }
    return false;
  };

  if (await clickTab(/map|mapa/i)) {
    await page.waitForSelector(".leaflet-tile-loaded", { timeout: 12000 }).catch(() => {});
    await settle(4500);
    await shot("trip-map");
  }
  if (await clickTab(/budget|orçamento/i)) {
    await settle(2500);
    await shot("trip-budget");
  }
}

await page.goto(`${BASE}/new`, { waitUntil: "networkidle" });
await settle(1200);
await shot("new-trip");

await page.goto(`${BASE}/discover`, { waitUntil: "networkidle" });
await settle(1800);
await shot("discover");

await browser.close();
console.log("done");
