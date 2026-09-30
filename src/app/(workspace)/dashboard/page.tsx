import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function DashboardPage() {
  return <AppShell current="/dashboard"><div className="page">
    <PageHeader title="Overview" description="Operational health for Main Store · Today" actions={<><button className="btn btn-secondary">Export</button><button className="btn btn-primary">New sale</button></>} />
    <section className="kpi-strip" aria-label="Key metrics">
      <div className="kpi"><div className="kpi-label">Net sales</div><div className="kpi-value">₹84,260</div><div className="kpi-change positive">↑ 8.4% vs yesterday</div></div>
      <div className="kpi"><div className="kpi-label">Transactions</div><div className="kpi-value">126</div><div className="kpi-change muted">₹669 average</div></div>
      <div className="kpi"><div className="kpi-label">Low-stock items</div><div className="kpi-value">14</div><div className="kpi-change warning">4 require action</div></div>
      <div className="kpi"><div className="kpi-label">Active customers</div><div className="kpi-value">1,842</div><div className="kpi-change positive">32 new this month</div></div>
    </section>
    <section className="section grid-2">
      <div><div className="section-header"><h2>Sales trend</h2><button className="btn btn-secondary">Last 7 days</button></div><div className="chart-placeholder">Replace with an accessible lightweight chart and accompanying data table.</div></div>
      <div><div className="section-header"><h2>Inventory attention</h2><a className="metadata" href="/inventory">View inventory →</a></div><div className="surface table-wrap"><table><thead><tr><th>Product</th><th>Stock</th><th>Status</th></tr></thead><tbody>
        <tr><td>Arabica Coffee 500g</td><td>4 / 12</td><td><StatusBadge tone="error">Critical</StatusBadge></td></tr>
        <tr><td>Whole Wheat Bread</td><td>8 / 10</td><td><StatusBadge tone="warning">Low</StatusBadge></td></tr>
        <tr><td>Organic Milk 1L</td><td>11 / 15</td><td><StatusBadge tone="warning">Low</StatusBadge></td></tr>
      </tbody></table></div></div>
    </section>
  </div></AppShell>;
}
