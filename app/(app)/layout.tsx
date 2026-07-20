import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppNav from "@/components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <div className="min-h-dvh">
      <AppNav user={session.user} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-28">{children}</main>
    </div>
  );
}
