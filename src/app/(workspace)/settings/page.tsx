import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsManager } from "@/components/settings/SettingsManager";
import { getSession } from "@/lib/auth/session";
import { getSettings } from "@/lib/services/settings";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getSession(); if (user?.role !== "admin") redirect("/dashboard");
  return <AppShell current="/settings"><div className="page"><PageHeader title="Settings" description="Manage stores, categories, and staff accounts." /><SettingsManager initialData={await getSettings()} /></div></AppShell>;
}
