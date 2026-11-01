import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSession } from "@/lib/auth/session";
import { getAnalytics } from "@/lib/services/analytics";
import { listStores } from "@/lib/services/settings";
import { requireStoreAccess } from "@/lib/auth/authorize";
import { redirect } from "next/navigation";

export default async function Page({ searchParams }: { searchParams: { storeId?: string } }) {
  const user = await getSession();
  if (!user) redirect("/login");
  const stores = user.role === "admin" ? await listStores() : [];
  const storeId = Number(searchParams.storeId || user.storeId || stores[0]?.storeId);
  if (!Number.isInteger(storeId) || storeId < 1) return <AppShell current="/analytics"><p className="page">Select an active store in Settings first.</p></AppShell>;
  try { requireStoreAccess(user, storeId); } catch { redirect("/analytics"); }
  const data = await getAnalytics(storeId);
  const forecast = data.forecast;
  return <AppShell current="/analytics"><div className="page">
    <PageHeader title="Analytics" description="Live sales, product, stock, and customer summaries." />
    {user.role === "admin" && <form method="get" style={{ display: "flex", gap: 16, alignItems: "end", marginBottom: 24 }}><label className="field"><span className="label">Store</span><select className="select" name="storeId" defaultValue={storeId}>{stores.map((store) => <option value={store.storeId} key={store.storeId}>{store.name}</option>)}</select></label><button className="btn btn-secondary">View analytics</button></form>}
    <section className="surface panel" style={{ marginBottom: 24 }}><h2>Sales outlook · next 7 days</h2>
      {forecast.nextWeek === null ? <p>Not enough recent data for a sales estimate. At least 3 sales across 3 different days in the last 14 complete days are needed.</p> : <>
        <p>Estimated sales: <strong>₹{forecast.nextWeek.toFixed(2)}</strong></p>
        <p>Last 7 complete days: ₹{forecast.recentWeek.toFixed(2)}. Previous 7 days: ₹{forecast.previousWeek.toFixed(2)}.</p>
        {forecast.changePercent !== null && <p>Week-over-week change: {forecast.changePercent > 0 ? "+" : ""}{forecast.changePercent}%. {forecast.changePercent < -20 ? "Sales have slowed; review demand before increasing stock." : forecast.changePercent > 20 ? "Sales have risen; review the stock risks below." : "Recent sales are relatively steady."}</p>}
      </>}
      <p className="metadata">Simple estimate: sales over the last 14 complete days divided by two, including days with no sales. Today is excluded; dates use India time. Based on {forecast.transactions} sales across {forecast.sellingDays} days. This is a baseline, not a guarantee or a seasonal model.</p>
    </section>
    <section style={{ marginBottom: 24 }}><h2>Stock recommendations</h2><p className="metadata">Daily demand = units sold in 14 complete days ÷ 14. Suggested orders target 14 days of stock or the reorder threshold, whichever is higher, minus stock and pending purchase quantities (including drafts). Days left uses on-hand stock only; confirm delivery dates before ordering. Stockouts can make sales understate demand.</p>
      <div className="surface table-wrap"><table><thead><tr><th>Product</th><th>Stock</th><th>Sold / 14 days</th><th>Planned incoming</th><th>Est. days left</th><th>Suggested action</th></tr></thead><tbody>{data.recommendations.map((item) => <tr key={item.productId}><td>{item.name}</td><td>{item.quantity}</td><td>{item.unitsSold}</td><td>{item.pendingQty}</td><td>{item.daysLeft === null ? "No recent demand" : item.daysLeft.toFixed(1)}</td><td>{item.advice}</td></tr>)}</tbody></table>{!data.recommendations.length && <p className="empty-state">No active inventory at this store yet.</p>}</div>
    </section>
    <div className="grid-2"><section><div className="section-header"><h2>Top products</h2></div><div className="surface table-wrap"><table><thead><tr><th>Product</th><th>Units</th><th>Revenue</th></tr></thead><tbody>{data.topProducts.map((product) => <tr key={product.name}><td>{product.name}</td><td>{product.unitsSold}</td><td>₹{Number(product.revenue).toFixed(2)}</td></tr>)}</tbody></table></div></section>
    <section><div className="section-header"><h2>Customer segments</h2></div><div className="surface table-wrap"><table><thead><tr><th>Segment</th><th>Customers</th></tr></thead><tbody>{data.segments.map((segment) => <tr key={segment.segment}><td>{segment.segment.replace("_", " ")}</td><td>{segment.customerCount}</td></tr>)}</tbody></table></div></section></div>
  </div></AppShell>;
}
