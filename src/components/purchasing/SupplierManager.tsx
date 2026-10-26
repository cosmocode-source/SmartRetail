"use client";

import { useState, type FormEvent } from "react";
import type { Supplier } from "@/lib/services/purchasing";
import type { SupplierDocument } from "@/lib/services/supplierDocuments";

export function SupplierManager({ initialSuppliers, initialDocuments }: { initialSuppliers: Supplier[]; initialDocuments: SupplierDocument[] }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [documents, setDocuments] = useState(initialDocuments);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json();
    if (!response.ok) return setError(result.error || "Supplier could not be saved.");
    formElement.reset();
    const refreshed = await fetch("/api/suppliers").then((value) => value.json());
    setSuppliers(refreshed.suppliers);
  }
  async function addDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const formElement = event.currentTarget; const form = new FormData(formElement);
    const response = await fetch("/api/supplier-documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supplierId: Number(form.get("supplierId")), documentType: form.get("documentType"), storageKey: form.get("storageKey"), validTill: form.get("validTill") || null }) });
    const result = await response.json(); if (!response.ok) return setError(result.error || "Document could not be saved."); formElement.reset();
    const refreshed = await fetch("/api/supplier-documents").then((value) => value.json()); setDocuments(refreshed.documents);
  }
  return <div style={{ display: "grid", gap: 24 }}>
    <form className="surface panel" onSubmit={submit} style={{ display: "grid", gap: 16 }}><h2>Add supplier</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
      <label className="field"><span className="label">Name</span><input className="input" name="name" required /></label><label className="field"><span className="label">Email</span><input className="input" name="email" type="email" required /></label><label className="field"><span className="label">Phone</span><input className="input" name="phone" /></label><label className="field"><span className="label">Address</span><input className="input" name="address" /></label>
    </div>{error && <p className="field-error" role="alert">{error}</p>}<div><button className="btn btn-primary">Add supplier</button></div></form>
    <section className="surface table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th></tr></thead><tbody>{suppliers.map((supplier) => <tr key={supplier.supplierId}><td>{supplier.name}</td><td>{supplier.email || "—"}</td><td>{supplier.phone || "—"}</td><td>{supplier.address || "—"}</td></tr>)}</tbody></table></section>
    <form className="surface panel" onSubmit={addDocument} style={{ display: "grid", gap: 16 }}><h2>Add document reference</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}><label className="field"><span className="label">Supplier</span><select className="select" name="supplierId">{suppliers.map((supplier) => <option key={supplier.supplierId} value={supplier.supplierId}>{supplier.name}</option>)}</select></label><label className="field"><span className="label">Type</span><select className="select" name="documentType"><option value="certificate">Certificate</option><option value="contract">Contract</option><option value="catalog">Catalog</option><option value="other">Other</option></select></label><label className="field"><span className="label">File/link reference</span><input className="input" name="storageKey" required /></label><label className="field"><span className="label">Valid until</span><input className="input" name="validTill" type="date" /></label></div><div><button className="btn btn-primary">Save reference</button></div></form>
    <section className="surface table-wrap"><table><thead><tr><th>Supplier</th><th>Type</th><th>Reference</th><th>Valid until</th></tr></thead><tbody>{documents.map((document) => <tr key={document.id}><td>{suppliers.find((supplier) => supplier.supplierId === document.supplierId)?.name || document.supplierId}</td><td>{document.documentType}</td><td>{document.storageKey}</td><td>{document.validTill || "—"}</td></tr>)}</tbody></table>{documents.length === 0 && <div className="empty-state"><p>No document references yet.</p></div>}</section>
  </div>;
}
