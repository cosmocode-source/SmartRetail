"use client";

import { useEffect, useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Product } from "@/lib/services/products";
import type { PurchaseOrder, Supplier } from "@/lib/services/purchasing";
import type { Store } from "@/lib/services/settings";
import type { InventoryItem } from "@/lib/services/inventory";

type Props = { initialStoreId: number; stores: Store[]; initialInventory: InventoryItem[]; initialOrders: PurchaseOrder[]; suppliers: Supplier[]; products: Product[] };

export function PurchaseOrderManager({ initialStoreId, stores, initialInventory, initialOrders, suppliers, products }: Props) {
  const [storeId, setStoreId] = useState(initialStoreId);
  const [orders, setOrders] = useState(initialOrders);
  const [inventory, setInventory] = useState(initialInventory);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const store = stores.find((item) => item.storeId === storeId);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setOrders([]); setInventory([]);
    async function load() {
      try {
        const responses = await Promise.all([
          fetch(`/api/purchase-orders?storeId=${storeId}`, { signal: controller.signal }),
          fetch(`/api/inventory?storeId=${storeId}`, { signal: controller.signal })
        ]);
        const [orderData, stockData] = await Promise.all(responses.map((response) => response.json()));
        if (responses.some((response) => !response.ok)) throw new Error(orderData.error || stockData.error || "Could not load this store.");
        if (!controller.signal.aborted) { setOrders(orderData.orders); setInventory(stockData.items); }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load this store.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [storeId, revision]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      const response = await fetch("/api/purchase-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supplierId: Number(form.get("supplierId")), storeId, expectedAt: form.get("expectedAt") || null, items: [{ productId: Number(form.get("productId")), orderedQty: Number(form.get("orderedQty")), unitCost: Number(form.get("unitCost")) }] }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Purchase order could not be saved.");
      formElement.reset(); setRevision((value) => value + 1);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Purchase order could not be saved."); }
    finally { setBusy(false); }
  }

  async function receive(poId: number) {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/purchase-orders/${poId}/receive`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Receiving failed.");
      setRevision((value) => value + 1);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Receiving failed."); }
    finally { setBusy(false); }
  }

  return <div style={{ display: "grid", gap: 24 }}>
    <label className="field"><span className="label">Order stock for store</span><select className="select" value={storeId} disabled={busy} onChange={(event) => setStoreId(Number(event.target.value))}>{stores.map((item) => <option key={item.storeId} value={item.storeId}>{item.name} · {item.location}</option>)}</select></label>
    {error && <p className="field-error" role="alert">{error}</p>}
    <section aria-busy={loading}><h2>Inventory at {store?.name}</h2>{loading ? <p role="status">Loading store stock…</p> : <div className="surface table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>In stock</th><th>Reorder threshold</th><th>Suggested order</th></tr></thead><tbody>{products.filter((product) => product.active).map((product) => {
      const stock = inventory.find((item) => item.productId === product.productId);
      return <tr key={product.productId}><td>{product.name}</td><td>{product.sku}</td><td>{stock?.quantity ?? 0}</td><td>{stock?.reorderThreshold ?? "Not set"}</td><td>{stock?.suggestedReorderQty ?? "Not set"}</td></tr>;
    })}</tbody></table>{!products.some((product) => product.active) && <p className="empty-state">No active products yet.</p>}</div>}</section>
    <form className="surface panel" onSubmit={submit} style={{ display: "grid", gap: 16 }}><h2>New purchase order · {store?.name}</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
      <label className="field"><span className="label">Supplier</span><select className="select" name="supplierId" required>{suppliers.filter((supplier) => supplier.active).map((supplier) => <option key={supplier.supplierId} value={supplier.supplierId}>{supplier.name}</option>)}</select></label>
      <label className="field"><span className="label">Product</span><select className="select" name="productId" required>{products.filter((product) => product.active).map((product) => <option key={product.productId} value={product.productId}>{product.name} · {inventory.find((item) => item.productId === product.productId)?.quantity ?? 0} in stock</option>)}</select></label>
      <label className="field"><span className="label">Quantity</span><input className="input" name="orderedQty" type="number" min="1" required /></label>
      <label className="field"><span className="label">Unit cost</span><input className="input" name="unitCost" type="number" min="0.01" step="0.01" required /></label>
      <label className="field"><span className="label">Expected delivery date</span><input className="input" name="expectedAt" type="date" /></label>
    </div><button className="btn btn-primary" disabled={busy || loading || !suppliers.some((supplier) => supplier.active) || !products.some((product) => product.active)}>{busy ? "Saving…" : "Create order"}</button></form>
    <section className="surface table-wrap"><table><thead><tr><th>Order</th><th>Supplier</th><th>Expected delivery</th><th>Items</th><th>Progress</th><th>Status</th><th>Action</th></tr></thead><tbody>{orders.map((order) => <tr key={order.poId}><td>PO-{order.poId}</td><td>{order.supplierName}</td><td>{order.expectedAt || "Not specified"}</td><td>{order.itemCount}</td><td>{order.receivedQty} / {order.orderedQty}</td><td><StatusBadge tone={order.status === "received" ? "success" : "warning"}>{order.status}</StatusBadge></td><td>{order.status !== "received" && order.status !== "cancelled" && <button className="btn btn-secondary" disabled={busy || loading} onClick={() => void receive(order.poId)}>Receive all</button>}</td></tr>)}</tbody></table>{!loading && orders.length === 0 && <p className="empty-state">No purchase orders for this store.</p>}</section>
  </div>;
}
