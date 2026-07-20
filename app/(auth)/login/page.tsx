import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if ((await auth())?.user) redirect("/dashboard");
  return <AuthForm mode="login" />;
}
