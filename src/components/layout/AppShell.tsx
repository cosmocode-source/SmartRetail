import { getSession } from "@/lib/auth/session";

const nav: [string, string, boolean][] = [
  ["/dashboard", "Overview", false], ["/pos", "Point of Sale", false], ["/inventory", "Inventory", false],
  ["/products", "Products", false], ["/purchase-orders", "Purchase orders", true],
  ["/suppliers", "Suppliers", true], ["/customers", "Customers", false], ["/analytics", "Analytics", false], ["/settings", "Settings", true]
];

export async function AppShell({ children, current = "/dashboard" }: { children: React.ReactNode; current?: string }) {
  const user = await getSession();
  return <div className="app-shell">
    <aside className="sidebar" aria-label="Primary navigation">
      <a className="brand" href="/dashboard"><span className="brand-mark">SR</span><span>SmartRetail</span></a>
      <nav className="nav">{nav.filter(([, , adminOnly]) => !adminOnly || user?.role === "admin").map(([href, label]) => <a key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</a>)}</nav>
      <div className="sidebar-footer"><strong>{user?.storeId ? `Store ${user.storeId}` : "All stores"}</strong><div className="metadata">{user?.role === "admin" ? "Admin" : "Staff"} workspace</div><form action="/api/auth/logout" method="post"><button className="btn btn-secondary" type="submit">Sign out</button></form></div>
    </aside>
    <main className="main"><header className="topbar"><span className="metadata">SmartRetail</span><strong>{user?.role === "admin" ? "Admin" : "Store Staff"}</strong></header>{children}</main>
  </div>;
}
