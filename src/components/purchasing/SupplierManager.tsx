"use client";

import { useState, type FormEvent } from "react";
import type { Supplier } from "@/lib/services/purchasing";

export function SupplierManager({ initialSuppliers }: { initialSuppliers: Supplier[] }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json();
    if (!response.ok) return setError(result.error || "Supplier could not be saved.");
    event.currentTarget.reset();
    const refreshed = await fetch("/api/suppliers").then((value) => value.json());
    setSuppliers(refreshed.suppliers);
  }
  return <div style={{ display: "grid", gap: 24 }}>
    <form className="surface panel" onSubmit={submit} style={{ display: "grid", gap: 16 }}><h2>Add supplier</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
      <label className="field"><span className="label">Name</span><input className="input" name="name" required /></label><label className="field"><span className="label">Email</span><input className="input" name="email" type="email" required /></label><label className="field"><span className="label">Phone</span><input className="input" name="phone" /></label><label className="field"><span className="label">Address</span><input className="input" name="address" /></label>
    </div>{error && <p className="field-error" role="alert">{error}</p>}<div><button className="btn btn-primary">Add supplier</button></div></form>
    <section className="surface table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th></tr></thead><tbody>{suppliers.map((supplier) => <tr key={supplier.supplierId}><td>{supplier.name}</td><td>{supplier.email || "—"}</td><td>{supplier.phone || "—"}</td><td>{supplier.address || "—"}</td></tr>)}</tbody></table></section>
  </div>;
}
