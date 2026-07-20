import { cookies } from "next/headers";
import { DEFAULT_LOCALE, getDictionary, type Locale } from "./i18n";

export const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value === "pt" || value === "en" ? value : DEFAULT_LOCALE;
}

export async function getDict() {
  return getDictionary(await getLocale());
}
