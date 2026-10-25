import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getSession } from "@/lib/auth/session";
import { getAnalytics } from "@/lib/services/analytics";

export default async function DashboardPage() {
  const user = await getSession(); const data = await getAnalytics(user?.storeId || 1);
  return <AppShell current="/dashboard"><div className="page">
    <PageHeader title="Overview" description="Operational health for Main Store" actions={<a className="btn btn-primary" href="/pos">New sale</a>} />
    <section className="kpi-strip" aria-label="Key metrics">
      <div className="kpi"><div className="kpi-label">Net sales</div><div className="kpi-value">₹{Number(data.summary.netSales).toFixed(2)}</div></div>
      <div className="kpi"><div className="kpi-label">Transactions</div><div className="kpi-value">{data.summary.transactionCount}</div><div className="kpi-change muted">₹{Number(data.summary.averageSale).toFixed(2)} average</div></div>
      <div className="kpi"><div className="kpi-label">Low-stock items</div><div className="kpi-value">{data.summary.lowStockCount}</div><div className="kpi-change warning">Require attention</div></div>
      <div className="kpi"><div className="kpi-label">Customers</div><div className="kpi-value">{data.summary.customerCount}</div></div>
    </section>
    <section className="section grid-2">
      <div><div className="section-header"><h2>Sales · last 7 days</h2></div><div className="surface table-wrap"><table><thead><tr><th>Date</th><th>Transactions</th><th>Revenue</th></tr></thead><tbody>{data.dailySales.map((day) => <tr key={day.day}><td>{new Date(day.day).toLocaleDateString()}</td><td>{day.transactions}</td><td>₹{Number(day.revenue).toFixed(2)}</td></tr>)}</tbody></table></div></div>
      <div><div className="section-header"><h2>Inventory attention</h2><a className="metadata" href="/inventory">View inventory →</a></div><div className="surface table-wrap"><table><thead><tr><th>Product</th><th>Stock</th><th>Status</th></tr></thead><tbody>
        {data.lowStock.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.quantity} / {item.reorderThreshold}</td><td><StatusBadge tone="warning">Low</StatusBadge></td></tr>)}
      </tbody></table></div></div>
    </section>
  </div></AppShell>;
}
