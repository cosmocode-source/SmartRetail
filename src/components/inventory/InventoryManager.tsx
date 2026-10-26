"use client";

import { useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { InventoryItem, StockMovement } from "@/lib/services/inventory";

export function InventoryManager({ storeId, initialItems, initialMovements }: { storeId: number; initialItems: InventoryItem[]; initialMovements: StockMovement[] }) {
  const [items, setItems] = useState(initialItems);
  const [movements, setMovements] = useState(initialMovements);
  const [error, setError] = useState("");

  async function reload() {
    const response = await fetch(`/api/inventory?storeId=${storeId}`);
    const result = await response.json();
    if (response.ok) { setItems(result.items); setMovements(result.movements); }
  }

  async function adjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/inventory/adjustments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, productId: Number(form.get("productId")), changeQty: Number(form.get("changeQty")), reason: form.get("reason") })
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error || "Adjustment failed.");
    formElement.reset();
    await reload();
  }

  return <div style={{ display: "grid", gap: 24 }}>
    <form className="surface panel" onSubmit={adjust} style={{ display: "grid", gap: 16 }}>
      <h2>Adjust stock</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <label className="field"><span className="label">Product</span><select className="select" name="productId" required>{items.map((item) => <option key={item.productId} value={item.productId}>{item.name} ({item.quantity})</option>)}</select></label>
        <label className="field"><span className="label">Change</span><input className="input" name="changeQty" type="number" placeholder="Use -2 or 5" required /></label>
        <label className="field"><span className="label">Reason</span><input className="input" name="reason" placeholder="Delivery, damage, correction" required /></label>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div><button className="btn btn-primary">Save adjustment</button></div>
    </form>

    <section className="surface table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>Quantity</th><th>Threshold</th><th>Status</th><th>Suggested order</th></tr></thead><tbody>
      {items.map((item) => { const low = item.quantity <= item.reorderThreshold; return <tr key={item.productId}><td>{item.name}</td><td>{item.sku}</td><td>{item.quantity}</td><td>{item.reorderThreshold}</td><td><StatusBadge tone={low ? "warning" : "success"}>{low ? "Low" : "Healthy"}</StatusBadge></td><td>{item.suggestedReorderQty}</td></tr>; })}
    </tbody></table></section>

    <section><div className="section-header"><h2>Recent movements</h2></div><div className="surface table-wrap"><table><thead><tr><th>Product</th><th>Change</th><th>Reason</th><th>Time</th></tr></thead><tbody>
      {movements.map((movement) => <tr key={movement.movementId}><td>{movement.productName}</td><td className={movement.changeQty > 0 ? "positive" : "warning"}>{movement.changeQty > 0 ? "+" : ""}{movement.changeQty}</td><td>{movement.reason}</td><td>{movement.createdAt}</td></tr>)}
    </tbody></table>{movements.length === 0 && <div className="empty-state"><p>No stock movements yet.</p></div>}</div></section>
  </div>;
}
