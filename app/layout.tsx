import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { I18nProvider } from "@/components/i18n-provider";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: "Atlas AI. The AI travel planner", template: "%s · Atlas AI" },
  description:
    "Describe your dream trip in one sentence. Atlas AI plans every day of it: itinerary, budget, restaurants, routes and local tips.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <I18nProvider locale={locale} dict={dict}>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
