import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerManager } from "@/components/customers/CustomerManager";
import { listCustomers } from "@/lib/services/customers";

export default async function Page() {
  const customers = await listCustomers();
  return <AppShell current="/customers"><div className="page">
    <PageHeader title="Customers" description="Review purchase totals, loyalty balances, and customer segments." />
    <CustomerManager initialCustomers={customers} />
  </div></AppShell>;
}
