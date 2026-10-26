import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PurchaseOrderManager } from "@/components/purchasing/PurchaseOrderManager";
import { getSession } from "@/lib/auth/session";
import { listProducts } from "@/lib/services/products";
import { listPurchaseOrders, listSuppliers } from "@/lib/services/purchasing";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getSession(); if (user?.role !== "admin") redirect("/dashboard"); const storeId = user.storeId || 1;
  const [orders, suppliers, products] = await Promise.all([listPurchaseOrders(storeId), listSuppliers(), listProducts()]);
  return <AppShell current="/purchase-orders"><div className="page">
    <PageHeader title="Purchase orders" description="Create supplier orders and receive stock once." />
    <PurchaseOrderManager storeId={storeId} initialOrders={orders} suppliers={suppliers} products={products} />
  </div></AppShell>;
}
