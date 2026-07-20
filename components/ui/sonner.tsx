"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: { background: "var(--popover)", border: "1px solid var(--border)", color: "var(--foreground)" },
      }}
    />
  );
}
