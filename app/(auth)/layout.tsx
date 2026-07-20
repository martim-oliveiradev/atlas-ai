import Link from "next/link";
import { Compass } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-glow flex min-h-dvh flex-col items-center justify-center gap-8 px-4">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <Compass className="size-6 text-primary" />
        Atlas
      </Link>
      {children}
    </div>
  );
}
