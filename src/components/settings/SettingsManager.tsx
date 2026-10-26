"use client";

import { useState, type FormEvent } from "react";
import type { StaffUser, Store } from "@/lib/services/settings";

type SettingsData = { stores: Store[]; users: StaffUser[]; categories: { categoryId: number; name: string }[] };

export function SettingsManager({ initialData }: { initialData: SettingsData }) {
  const [data, setData] = useState(initialData); const [error, setError] = useState("");
  async function refresh() { const response = await fetch("/api/settings"); if (response.ok) setData(await response.json()); }
  async function submit(event: FormEvent<HTMLFormElement>, type: "store" | "category" | "staff") {
    event.preventDefault(); setError(""); const formElement = event.currentTarget; const form = new FormData(formElement);
    const values: Record<string, unknown> = { type, ...Object.fromEntries(form) }; if (type === "staff") values.storeId = Number(form.get("storeId"));
    const response = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const result = await response.json(); if (!response.ok) return setError(result.error || "Could not save."); formElement.reset(); await refresh();
  }
  return <div style={{ display: "grid", gap: 24 }}>{error && <p className="field-error" role="alert">{error}</p>}<div className="grid-2">
    <form className="surface panel" onSubmit={(event) => void submit(event, "store")} style={{ display: "grid", gap: 16 }}><h2>Add store</h2><label className="field"><span className="label">Name</span><input className="input" name="name" required /></label><label className="field"><span className="label">Location</span><input className="input" name="location" required /></label><button className="btn btn-primary">Add store</button></form>
    <form className="surface panel" onSubmit={(event) => void submit(event, "category")} style={{ display: "grid", gap: 16 }}><h2>Add category</h2><label className="field"><span className="label">Name</span><input className="input" name="name" required /></label><button className="btn btn-primary">Add category</button><div className="metadata">Existing: {data.categories.map((category) => category.name).join(", ")}</div></form>
  </div><form className="surface panel" onSubmit={(event) => void submit(event, "staff")} style={{ display: "grid", gap: 16 }}><h2>Add store staff</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}><label className="field"><span className="label">Name</span><input className="input" name="name" required /></label><label className="field"><span className="label">Email</span><input className="input" name="email" type="email" required /></label><label className="field"><span className="label">Temporary password</span><input className="input" name="password" type="password" minLength={8} required /></label><label className="field"><span className="label">Store</span><select className="select" name="storeId">{data.stores.map((store) => <option key={store.storeId} value={store.storeId}>{store.name}</option>)}</select></label></div><div><button className="btn btn-primary">Add staff account</button></div></form>
  <section className="surface table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Store</th></tr></thead><tbody>{data.users.map((user) => <tr key={user.userId}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.storeName || "All stores"}</td></tr>)}</tbody></table></section></div>;
}
