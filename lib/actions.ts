"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "./prisma";
import { auth, signIn, signOut } from "./auth";
import { itinerarySchema, type Itinerary } from "./itinerary";
import { flightSchema, mergeFlights, parseFlights, type Flight } from "./flights";
import { sampleFlights, sampleItinerary, samplePrompt } from "./sample-trip";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password needs at least 8 characters"),
});

const registerSchema = credentialsSchema.extend({
  name: z.string().min(2, "Tell us your name"),
});

const FREE_TRIP_LIMIT = 2;

async function requireUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) redirect("/login");
  return id;
}

export async function register(input: { name: string; email: string; password: string }) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "An account with this email already exists" };

  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash: await hash(password, 10) },
  });

  const start = new Date();
  start.setDate(start.getDate() + 45);
  await prisma.$transaction([
    prisma.trip.create({
      data: {
        userId: user.id,
        title: sampleItinerary.title,
        city: sampleItinerary.city,
        country: sampleItinerary.country,
        startDate: start,
        days: sampleItinerary.days.length,
        budget: sampleItinerary.totalCost,
        currency: sampleItinerary.currency,
        style: "balanced",
        itinerary: JSON.stringify(sampleItinerary),
        flights: JSON.stringify(sampleFlights),
        messages: { create: { role: "user", content: samplePrompt } },
      },
    }),
    prisma.user.update({ where: { id: user.id }, data: { tripsCreated: { increment: 1 } } }),
  ]);

  return login({ email, password });
}

export async function login(input: { email: string; password: string }) {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/dashboard" });
    return {};
  } catch (e) {
    if (e instanceof AuthError) return { error: "Invalid email or password" };
    throw e;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function saveTrip(itinerary: Itinerary, opts?: { startDate?: string; style?: string }) {
  const uid = await requireUser();

  const user = await prisma.user.findUniqueOrThrow({ where: { id: uid }, select: { tripsCreated: true, unlimited: true } });
  if (!user.unlimited && user.tripsCreated >= FREE_TRIP_LIMIT) {
    return { error: `limit:${FREE_TRIP_LIMIT}` };
  }

  const it = itinerarySchema.parse(itinerary);
  const [trip] = await prisma.$transaction([
    prisma.trip.create({
      data: {
        userId: uid,
        title: it.title,
        city: it.city,
        country: it.country,
        startDate: opts?.startDate ? new Date(opts.startDate) : null,
        days: it.days.length,
        budget: it.totalCost,
        currency: it.currency,
        style: opts?.style ?? "balanced",
        itinerary: JSON.stringify(it),
      },
    }),
    prisma.user.update({ where: { id: uid }, data: { tripsCreated: { increment: 1 } } }),
  ]);
  revalidatePath("/dashboard");
  redirect(`/trips/${trip.id}`);
}

export async function updateItinerary(tripId: string, itinerary: Itinerary) {
  const uid = await requireUser();
  const it = itinerarySchema.parse(itinerary);
  await prisma.trip.update({
    where: { id: tripId, userId: uid },
    data: {
      title: it.title,
      city: it.city,
      country: it.country,
      days: it.days.length,
      budget: it.totalCost,
      currency: it.currency,
      itinerary: JSON.stringify(it),
    },
  });
  revalidatePath(`/trips/${tripId}`);
}

export async function deleteTrip(tripId: string) {
  const uid = await requireUser();
  await prisma.trip.delete({ where: { id: tripId, userId: uid } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function saveChatMessages(tripId: string, userText: string, assistantText: string) {
  const uid = await requireUser();
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: uid }, select: { id: true } });
  if (!trip) return;
  await prisma.message.createMany({
    data: [
      { tripId, role: "user", content: userText },
      { tripId, role: "assistant", content: assistantText },
    ],
  });
}

export async function toggleFavorite(input: { kind: string; name: string; place: string; note?: string }) {
  const uid = await requireUser();
  const where = { userId_kind_name: { userId: uid, kind: input.kind, name: input.name } };
  const existing = await prisma.favorite.findUnique({ where });
  if (existing) {
    await prisma.favorite.delete({ where });
  } else {
    await prisma.favorite.create({ data: { userId: uid, ...input } });
  }
  revalidatePath("/saved");
  return { saved: !existing };
}

export async function updateProfile(input: { name: string; prefs: Record<string, string> }) {
  const uid = await requireUser();
  const name = z.string().min(2).parse(input.name);
  await prisma.user.update({
    where: { id: uid },
    data: { name, prefs: JSON.stringify(input.prefs) },
  });
  revalidatePath("/profile");
}

export async function setPacked(tripId: string, items: string[]) {
  const uid = await requireUser();
  await prisma.trip.update({
    where: { id: tripId, userId: uid },
    data: { packed: JSON.stringify(z.array(z.string()).parse(items)) },
  });
}

export async function applyImport(
  tripId: string,
  data: { flights: Flight[]; hotels: { name: string; area: string; pricePerNight?: number; bookingRef?: string }[] }
) {
  const uid = await requireUser();
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: uid } });
  if (!trip) throw new Error("Trip not found");

  const flights = mergeFlights(parseFlights(trip.flights), z.array(flightSchema).parse(data.flights));

  let itineraryJson = trip.itinerary;
  if (trip.itinerary && data.hotels.length) {
    try {
      const it = itinerarySchema.parse(JSON.parse(trip.itinerary));
      const known = new Set(it.hotels.map((h) => h.name.toLowerCase()));
      for (const h of data.hotels) {
        if (known.has(h.name.toLowerCase())) continue;
        it.hotels.push({
          name: h.name,
          area: h.area,
          pricePerNight: h.pricePerNight ?? 0,
          style: "booked",
          note: h.bookingRef ? `Booking ${h.bookingRef}` : "Imported from booking confirmation.",
        });
      }
      itineraryJson = JSON.stringify(it);
    } catch {}
  }

  await prisma.trip.update({
    where: { id: tripId },
    data: { flights: JSON.stringify(flights), itinerary: itineraryJson },
  });
  revalidatePath(`/trips/${tripId}`);
  return { flights: flights.length };
}

export async function ensureShareToken(tripId: string) {
  const uid = await requireUser();
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: uid } });
  if (!trip) throw new Error("Trip not found");
  if (trip.shareToken) return { token: trip.shareToken };
  const token = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  await prisma.trip.update({ where: { id: tripId }, data: { shareToken: token } });
  return { token };
}
