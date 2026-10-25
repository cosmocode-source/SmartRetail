import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PosManager } from "@/components/pos/PosManager";
import { getSession } from "@/lib/auth/session";
import { listSellableProducts } from "@/lib/services/checkout";
import { listCustomers } from "@/lib/services/customers";

export default async function Page() {
  const user = await getSession();
  const storeId = user?.storeId || 1;
  const [products, customers] = await Promise.all([listSellableProducts(storeId), listCustomers()]);
  return <AppShell current="/pos"><div className="page">
    <PageHeader title="Point of Sale" description="Build an in-store basket and complete an atomic checkout." />
    <PosManager storeId={storeId} products={products} customers={customers} />
  </div></AppShell>;
}
