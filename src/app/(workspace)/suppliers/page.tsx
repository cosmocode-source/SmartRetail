import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";

export default function Page() {
  return <AppShell current="/suppliers"><div className="page">
    <PageHeader title="Suppliers" description="Manage supplier records and flexible certificate or contract documents." actions={<button className="btn btn-primary">Add supplier</button>} />
    <section className="surface">
      <div className="toolbar"><label className="field"><span className="label">Search</span><input className="input" placeholder="Search records" /></label><label className="field"><span className="label">Status</span><select className="select"><option>All statuses</option><option>Active</option><option>Needs attention</option></select></label></div>
      <div className="empty-state"><h2>Connect the suppliers service</h2><p>This implementation-ready layout defines the intended controls and states. Replace this draft state with server-loaded data from `src/lib/services`.</p><button className="btn btn-secondary">Review file guide</button></div>
    </section>
  </div></AppShell>;
}
