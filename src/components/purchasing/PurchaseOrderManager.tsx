"use client";

import { useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Product } from "@/lib/services/products";
import type { PurchaseOrder, Supplier } from "@/lib/services/purchasing";

export function PurchaseOrderManager({ storeId, initialOrders, suppliers, products }: { storeId: number; initialOrders: PurchaseOrder[]; suppliers: Supplier[]; products: Product[] }) {
  const [orders, setOrders] = useState(initialOrders); const [error, setError] = useState("");
  async function reload() { const result = await fetch(`/api/purchase-orders?storeId=${storeId}`).then((value) => value.json()); setOrders(result.orders); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const formElement = event.currentTarget; const form = new FormData(formElement);
    const response = await fetch("/api/purchase-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supplierId: Number(form.get("supplierId")), storeId, expectedAt: form.get("expectedAt") || null, items: [{ productId: Number(form.get("productId")), orderedQty: Number(form.get("orderedQty")), unitCost: Number(form.get("unitCost")) }] }) });
    const result = await response.json(); if (!response.ok) return setError(result.error || "Purchase order could not be saved."); formElement.reset(); await reload();
  }
  async function receive(poId: number) { const response = await fetch(`/api/purchase-orders/${poId}/receive`, { method: "POST" }); const result = await response.json(); if (!response.ok) return setError(result.error); await reload(); }
  return <div style={{ display: "grid", gap: 24 }}><form className="surface panel" onSubmit={submit} style={{ display: "grid", gap: 16 }}><h2>New purchase order</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
    <label className="field"><span className="label">Supplier</span><select className="select" name="supplierId">{suppliers.map((supplier) => <option key={supplier.supplierId} value={supplier.supplierId}>{supplier.name}</option>)}</select></label><label className="field"><span className="label">Product</span><select className="select" name="productId">{products.filter((product) => product.active).map((product) => <option key={product.productId} value={product.productId}>{product.name}</option>)}</select></label><label className="field"><span className="label">Quantity</span><input className="input" name="orderedQty" type="number" min="1" required /></label><label className="field"><span className="label">Unit cost</span><input className="input" name="unitCost" type="number" min="0.01" step="0.01" required /></label><label className="field"><span className="label">Expected date</span><input className="input" name="expectedAt" type="date" /></label>
  </div>{error && <p className="field-error" role="alert">{error}</p>}<div><button className="btn btn-primary">Create order</button></div></form>
  <section className="surface table-wrap"><table><thead><tr><th>Order</th><th>Supplier</th><th>Items</th><th>Progress</th><th>Status</th><th></th></tr></thead><tbody>{orders.map((order) => <tr key={order.poId}><td>PO-{order.poId}</td><td>{order.supplierName}</td><td>{order.itemCount}</td><td>{order.receivedQty} / {order.orderedQty}</td><td><StatusBadge tone={order.status === "received" ? "success" : "warning"}>{order.status}</StatusBadge></td><td>{order.status !== "received" && <button className="btn btn-secondary" onClick={() => void receive(order.poId)}>Receive all</button>}</td></tr>)}</tbody></table>{orders.length === 0 && <div className="empty-state"><p>No purchase orders yet.</p></div>}</section></div>;
}
