
export type Rates = { base: string; date: string; rates: Record<string, number> };

export async function getRates(base: string): Promise<Rates | null> {
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const d = await res.json();
    return { base, date: d.date, rates: { [base]: 1, ...d.rates } };
  } catch {
    return null;
  }
}
