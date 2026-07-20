import { auth } from "@/lib/auth";
import Landing from "@/components/landing";

export default async function HomePage() {
  const session = await auth();
  return <Landing authed={!!session?.user} />;
}
