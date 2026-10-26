"use client";

import { useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Category, Product } from "@/lib/services/products";

export function ProductManager({ initialProducts, categories, canManage }: { initialProducts: Product[]; categories: Category[]; canManage: boolean }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload(search = query) {
    const response = await fetch(`/api/products?query=${encodeURIComponent(search)}`);
    const result = await response.json();
    if (response.ok) setProducts(result.products);
  }

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: form.get("sku"), name: form.get("name"), description: form.get("description"),
        categoryId: Number(form.get("categoryId")), price: Number(form.get("price"))
      })
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) return setError(result.error || "Product could not be saved.");
    formElement.reset();
    await reload();
  }

  async function toggle(product: Product) {
    const response = await fetch(`/api/products/${product.productId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active })
    });
    if (response.ok) await reload();
  }

  return <div style={{ display: "grid", gap: 24 }}>
    {canManage && <form className="surface panel" onSubmit={addProduct} style={{ display: "grid", gap: 16 }}>
      <h2>Add product</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <label className="field"><span className="label">SKU</span><input className="input" name="sku" required /></label>
        <label className="field"><span className="label">Name</span><input className="input" name="name" required /></label>
        <label className="field"><span className="label">Category</span><select className="select" name="categoryId" required>{categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.name}</option>)}</select></label>
        <label className="field"><span className="label">Price</span><input className="input" name="price" type="number" min="0.01" step="0.01" required /></label>
      </div>
      <label className="field"><span className="label">Description</span><input className="input" name="description" /></label>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div><button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Add product"}</button></div>
    </form>}

    <section className="surface">
      <form className="toolbar" onSubmit={(event) => { event.preventDefault(); void reload(); }}>
        <label className="field"><span className="label">Search</span><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or SKU" /></label>
        <button className="btn btn-secondary">Search</button>
      </form>
      <div className="table-wrap"><table><thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{products.map((product) => <tr key={product.productId}><td>{product.sku}</td><td><strong>{product.name}</strong><div className="metadata">{product.description}</div></td><td>{product.categoryName}</td><td>₹{Number(product.price).toFixed(2)}</td><td><StatusBadge tone={product.active ? "success" : "neutral"}>{product.active ? "Active" : "Inactive"}</StatusBadge></td><td>{canManage ? <button className="btn btn-secondary" onClick={() => void toggle(product)}>{product.active ? "Deactivate" : "Activate"}</button> : "—"}</td></tr>)}</tbody>
      </table>{products.length === 0 && <div className="empty-state"><p>No products found.</p></div>}</div>
    </section>
  </div>;
}
