import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  if ((await auth())?.user) redirect("/dashboard");
  return <AuthForm mode="signup" />;
}
