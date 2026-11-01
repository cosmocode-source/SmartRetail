import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PurchaseOrderManager } from "@/components/purchasing/PurchaseOrderManager";
import { getSession } from "@/lib/auth/session";
import { listProducts } from "@/lib/services/products";
import { listPurchaseOrders, listSuppliers } from "@/lib/services/purchasing";
import { redirect } from "next/navigation";
import { listStores } from "@/lib/services/settings";
import { getInventory } from "@/lib/services/inventory";

export default async function Page() {
  const user = await getSession(); if (user?.role !== "admin") redirect("/dashboard");
  const stores = await listStores();
  const storeId = stores[0]?.storeId;
  if (!storeId) return <AppShell current="/purchase-orders"><p className="page">Add an active store in Settings first.</p></AppShell>;
  const [orders, suppliers, products] = await Promise.all([listPurchaseOrders(storeId), listSuppliers(), listProducts()]);
  return <AppShell current="/purchase-orders"><div className="page">
    <PageHeader title="Purchase orders" description="Create supplier orders and receive stock once." />
    <PurchaseOrderManager initialStoreId={storeId} stores={stores} initialInventory={(await getInventory(storeId)).items} initialOrders={orders} suppliers={suppliers} products={products} />
  </div></AppShell>;
}
