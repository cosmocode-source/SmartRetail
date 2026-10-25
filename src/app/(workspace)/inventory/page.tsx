import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { InventoryManager } from "@/components/inventory/InventoryManager";
import { getSession } from "@/lib/auth/session";
import { getInventory } from "@/lib/services/inventory";

export default async function Page() {
  const user = await getSession();
  const storeId = user?.storeId || 1;
  const { items, movements } = await getInventory(storeId);
  return <AppShell current="/inventory"><div className="page">
    <PageHeader title="Inventory" description="Monitor stock, record adjustments, and act on reorder signals." />
    <InventoryManager storeId={storeId} initialItems={items} initialMovements={movements} />
  </div></AppShell>;
}
