import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { DAY_SLOTS, money, type Itinerary } from "./itinerary";
import { fill, type Dict } from "./i18n";

const fontDir = path.join(process.cwd(), "node_modules/@fontsource/inter/files");
Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(fontDir, "inter-latin-ext-400-normal.woff") },
    { src: path.join(fontDir, "inter-latin-ext-600-normal.woff"), fontWeight: 600 },
    { src: path.join(fontDir, "inter-latin-ext-700-normal.woff"), fontWeight: 700 },
  ],
});

const amber = "#c9852f";
const ink = "#1a1a1a";
const gray = "#6b6b6b";
const line = "#e2e2e2";

const s = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 10, color: ink, padding: 40, lineHeight: 1.4 },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  summary: { fontSize: 10.5, color: gray, marginBottom: 14 },
  chipRow: { flexDirection: "row", gap: 6, marginBottom: 20, flexWrap: "wrap" },
  chip: { fontSize: 9, color: gray, borderWidth: 1, borderColor: line, borderRadius: 10, paddingVertical: 3, paddingHorizontal: 8 },
  dayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 },
  dayLabel: { fontSize: 9, color: amber, fontWeight: 700 },
  dayTitle: { fontSize: 14, fontWeight: 700 },
  dayArea: { fontSize: 9, color: gray },
  slotRow: { flexDirection: "row", marginBottom: 7, paddingBottom: 7, borderBottomWidth: 0.5, borderBottomColor: line },
  slotLabel: { width: 70, fontSize: 8, color: amber, fontWeight: 700, textTransform: "uppercase" },
  slotBody: { flex: 1 },
  slotName: { fontSize: 10, fontWeight: 600 },
  slotNote: { fontSize: 9, color: gray, marginTop: 1 },
  slotCost: { fontSize: 9, color: gray, marginLeft: 8 },
  footRow: { fontSize: 9, color: gray, marginTop: 2 },
  tip: { fontSize: 9, color: gray, marginTop: 4 },
  dailyCost: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: line },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 12, marginTop: 4 },
  h2: { fontSize: 11, fontWeight: 700, marginBottom: 8, marginTop: 16 },
  hotelCard: { borderWidth: 1, borderColor: line, borderRadius: 6, padding: 10, marginBottom: 8 },
  hotelName: { fontSize: 10.5, fontWeight: 600 },
  hotelMeta: { fontSize: 8.5, color: gray, marginTop: 1, marginBottom: 4 },
  bullet: { flexDirection: "row", marginBottom: 5 },
  bulletDot: { width: 10, fontSize: 9, color: amber },
  bulletText: { flex: 1, fontSize: 9.5 },
  budgetRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: line },
  budgetLabel: { fontSize: 9.5 },
  budgetValue: { fontSize: 9.5, fontWeight: 600 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: gray,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: line,
    paddingTop: 8,
  },
});

function Footer({ page }: { page: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>Atlas AI</Text>
      <Text render={({ pageNumber, totalPages }) => `${page} · ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

export function TripPdf({ itinerary, t }: { itinerary: Itinerary; t: Dict }) {
  const it = itinerary;
  return (
    <Document title={it.title} author="Atlas AI">
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>{it.title}</Text>
        <Text style={s.summary}>{it.summary}</Text>
        <View style={s.chipRow}>
          <Text style={s.chip}>{`${it.city}, ${it.country}`}</Text>
          <Text style={s.chip}>{fill(t.trip.days, { n: it.days.length })}</Text>
          <Text style={s.chip}>{fill(t.trip.estimated, { amount: money(it.totalCost, it.currency) })}</Text>
        </View>

        {it.days.map((d) => (
          <View key={d.day} wrap={false} style={{ marginBottom: 16 }}>
            <View style={s.dayHeader}>
              <View>
                <Text style={s.dayLabel}>{fill(t.days, { n: d.day })}</Text>
                <Text style={s.dayTitle}>{d.title}</Text>
              </View>
              <Text style={s.dayArea}>{d.area}</Text>
            </View>
            {DAY_SLOTS.map(([slot]) => {
              const spot = d[slot];
              return (
                <View key={slot} style={s.slotRow}>
                  <Text style={s.slotLabel}>{t.day[slot]}</Text>
                  <View style={s.slotBody}>
                    <Text style={s.slotName}>{spot.name}</Text>
                    <Text style={s.slotNote}>{spot.note}</Text>
                  </View>
                  <Text style={s.slotCost}>{spot.cost > 0 ? money(spot.cost, it.currency) : t.day.free}</Text>
                </View>
              );
            })}
            <Text style={s.footRow}>{d.travel}</Text>
            <Text style={s.tip}>{d.tip}</Text>
            <View style={s.dailyCost}>
              <Text style={s.budgetLabel}>{t.day.estSpend}</Text>
              <Text style={s.budgetValue}>{money(d.dailyCost, it.currency)}</Text>
            </View>
          </View>
        ))}
        <Footer page={t.trip.tabs.itinerary} />
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>{t.insights.whereToStay}</Text>
        {it.hotels.map((h) => (
          <View key={h.name} style={s.hotelCard}>
            <Text style={s.hotelName}>{h.name}</Text>
            <Text style={s.hotelMeta}>{`${h.area} · ${h.style} · ${money(h.pricePerNight, it.currency)} ${t.insights.perNight}`}</Text>
            <Text style={{ fontSize: 9, color: gray }}>{h.note}</Text>
          </View>
        ))}

        <Text style={s.h2}>{t.budget.estimatedTotal}</Text>
        {(
          [
            ["accommodation", t.budget.accommodation],
            ["flights", t.budget.flights],
            ["food", t.budget.food],
            ["transport", t.budget.transport],
            ["activities", t.budget.activities],
            ["shopping", t.budget.shopping],
            ["emergency", t.budget.emergencyReserve],
          ] as const
        ).map(([key, label]) => (
          <View key={key} style={s.budgetRow}>
            <Text style={s.budgetLabel}>{label}</Text>
            <Text style={s.budgetValue}>{money(it.budget[key], it.currency)}</Text>
          </View>
        ))}
        <View style={[s.budgetRow, { borderBottomWidth: 0, marginTop: 4 }]}>
          <Text style={[s.budgetLabel, { fontWeight: 700 }]}>{t.budget.estimatedTotal}</Text>
          <Text style={[s.budgetValue, { fontWeight: 700 }]}>{money(it.totalCost, it.currency)}</Text>
        </View>

        <Text style={s.h2}>{t.insights.packing}</Text>
        <View style={s.chipRow}>
          {it.packing.map((p) => (
            <Text key={p} style={s.chip}>
              {p}
            </Text>
          ))}
        </View>

        <Text style={s.h2}>{t.insights.goodToKnow}</Text>
        {it.safety.map((sf) => (
          <View key={sf} style={s.bullet}>
            <Text style={s.bulletDot}>–</Text>
            <Text style={s.bulletText}>{sf}</Text>
          </View>
        ))}

        <Text style={s.h2}>{t.insights.hiddenGems}</Text>
        {it.hiddenGems.map((g) => (
          <View key={g.name} style={s.bullet}>
            <Text style={s.bulletDot}>–</Text>
            <Text style={s.bulletText}>
              <Text style={{ fontWeight: 600 }}>{g.name}. </Text>
              {g.note}
            </Text>
          </View>
        ))}

        <Text style={s.h2}>{t.insights.ifItRains}</Text>
        {it.rainPlan.map((r) => (
          <View key={r} style={s.bullet}>
            <Text style={s.bulletDot}>–</Text>
            <Text style={s.bulletText}>{r}</Text>
          </View>
        ))}
        <Footer page={t.trip.tabs.insights} />
      </Page>
    </Document>
  );
}
