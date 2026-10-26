"use client";

import { useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Customer } from "@/lib/services/customers";

export function CustomerManager({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers); const [query, setQuery] = useState(""); const [error, setError] = useState("");
  async function reload(search = query) { const result = await fetch(`/api/customers?query=${encodeURIComponent(search)}`).then((value) => value.json()); setCustomers(result.customers); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const formElement = event.currentTarget; const form = new FormData(formElement);
    const response = await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json(); if (!response.ok) return setError(result.error || "Customer could not be saved."); formElement.reset(); await reload();
  }
  return <div style={{ display: "grid", gap: 24 }}><form className="surface panel" onSubmit={submit} style={{ display: "grid", gap: 16 }}><h2>Add customer</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
    <label className="field"><span className="label">Name</span><input className="input" name="name" required /></label><label className="field"><span className="label">Phone</span><input className="input" name="phone" required /></label><label className="field"><span className="label">Email</span><input className="input" name="email" type="email" /></label>
  </div>{error && <p className="field-error" role="alert">{error}</p>}<div><button className="btn btn-primary">Add customer</button></div></form>
  <section className="surface"><form className="toolbar" onSubmit={(event) => { event.preventDefault(); void reload(); }}><label className="field"><span className="label">Search</span><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or phone" /></label><button className="btn btn-secondary">Search</button></form><div className="table-wrap"><table><thead><tr><th>Customer</th><th>Contact</th><th>Segment</th><th>Orders</th><th>Lifetime value</th><th>Points</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.customerId}><td>{customer.name}</td><td>{customer.phone}<div className="metadata">{customer.email}</div></td><td><StatusBadge tone={customer.segment === "vip" ? "success" : customer.segment === "at_risk" ? "warning" : "neutral"}>{customer.segment.replace("_", " ")}</StatusBadge></td><td>{customer.orderCount}</td><td>₹{Number(customer.lifetimeValue).toFixed(2)}</td><td>{customer.loyaltyPoints}</td></tr>)}</tbody></table>{customers.length === 0 && <div className="empty-state"><p>No customers found.</p></div>}</div></section></div>;
}
