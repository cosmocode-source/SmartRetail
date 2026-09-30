const nav = [
  ["/dashboard", "Overview"], ["/pos", "Point of Sale"], ["/inventory", "Inventory"],
  ["/products", "Products"], ["/purchase-orders", "Purchase orders"],
  ["/suppliers", "Suppliers"], ["/customers", "Customers"], ["/analytics", "Analytics"]
];

export function AppShell({ children, current = "/dashboard" }: { children: React.ReactNode; current?: string }) {
  return <div className="app-shell">
    <aside className="sidebar" aria-label="Primary navigation">
      <a className="brand" href="/dashboard"><span className="brand-mark">SR</span><span>SmartRetail</span></a>
      <nav className="nav">{nav.map(([href, label]) => <a key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</a>)}</nav>
      <div className="sidebar-footer"><strong>Main Store</strong><div className="metadata">Admin workspace</div></div>
    </aside>
    <main className="main"><header className="topbar"><span className="metadata">Main Store</span><strong>Admin User</strong></header>{children}</main>
  </div>;
}
