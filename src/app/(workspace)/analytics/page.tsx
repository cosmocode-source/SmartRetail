import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSession } from "@/lib/auth/session";
import { getAnalytics } from "@/lib/services/analytics";

export default async function Page() {
  const user = await getSession(); const data = await getAnalytics(user?.storeId || 1);
  return <AppShell current="/analytics"><div className="page">
    <PageHeader title="Analytics" description="Live sales, product, stock, and customer summaries." />
    <div className="grid-2"><section><div className="section-header"><h2>Top products</h2></div><div className="surface table-wrap"><table><thead><tr><th>Product</th><th>Units</th><th>Revenue</th></tr></thead><tbody>{data.topProducts.map((product) => <tr key={product.name}><td>{product.name}</td><td>{product.unitsSold}</td><td>₹{Number(product.revenue).toFixed(2)}</td></tr>)}</tbody></table></div></section>
    <section><div className="section-header"><h2>Customer segments</h2></div><div className="surface table-wrap"><table><thead><tr><th>Segment</th><th>Customers</th></tr></thead><tbody>{data.segments.map((segment) => <tr key={segment.segment}><td>{segment.segment.replace("_", " ")}</td><td>{segment.customerCount}</td></tr>)}</tbody></table></div></section></div>
  </div></AppShell>;
}
