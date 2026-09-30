import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "SmartRetail", template: "%s · SmartRetail" },
  description: "Professional retail POS, inventory, purchasing, and customer intelligence."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
