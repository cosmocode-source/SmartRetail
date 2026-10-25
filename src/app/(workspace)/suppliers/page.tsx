import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SupplierManager } from "@/components/purchasing/SupplierManager";
import { listSuppliers } from "@/lib/services/purchasing";

export default async function Page() {
  const suppliers = await listSuppliers();
  return <AppShell current="/suppliers"><div className="page">
    <PageHeader title="Suppliers" description="Manage supplier contact records used by purchasing." />
    <SupplierManager initialSuppliers={suppliers} />
  </div></AppShell>;
}
