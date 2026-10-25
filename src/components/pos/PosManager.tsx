"use client";

import { useMemo, useState } from "react";
import type { SellableProduct } from "@/lib/services/checkout";
import type { Customer } from "@/lib/services/customers";

type CartItem = SellableProduct & { cartQuantity: number };

export function PosManager({ storeId, products, customers }: { storeId: number; products: SellableProduct[]; customers: Customer[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.cartQuantity, 0), [cart]);

  function add(product: SellableProduct) {
    setMessage("");
    setCart((current) => {
      const found = current.find((item) => item.productId === product.productId);
      if (found) return current.map((item) => item.productId === product.productId && item.cartQuantity < item.quantity ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      return [...current, { ...product, cartQuantity: 1 }];
    });
  }

  function change(productId: number, delta: number) {
    setCart((current) => current.flatMap((item) => {
      if (item.productId !== productId) return [item];
      const quantity = item.cartQuantity + delta;
      return quantity < 1 ? [] : [{ ...item, cartQuantity: Math.min(quantity, item.quantity) }];
    }));
  }

  async function completeSale() {
    setMessage("");
    const response = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, customerId, discountAmount: discount, paymentMethod, items: cart.map((item) => ({ productId: item.productId, quantity: item.cartQuantity })) })
    });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error || "Checkout failed.");
    setCart([]);
    setDiscount(0);
    setMessage(`Sale complete · ${result.receiptNumber} · ₹${Number(result.totalAmount).toFixed(2)}`);
  }

  return <div className="grid-2">
    <section><div className="section-header"><h2>Products</h2></div><div className="surface table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th></th></tr></thead><tbody>
      {products.map((product) => <tr key={product.productId}><td><strong>{product.name}</strong><div className="metadata">{product.sku}</div></td><td>₹{Number(product.price).toFixed(2)}</td><td>{product.quantity}</td><td><button className="btn btn-secondary" onClick={() => add(product)}>Add</button></td></tr>)}
    </tbody></table></div></section>
    <section><div className="section-header"><h2>Cart</h2></div><div className="surface panel" style={{ display: "grid", gap: 16 }}>
      {cart.length === 0 ? <p className="muted">Add a product to begin.</p> : cart.map((item) => <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><span>{item.name}<br /><span className="metadata">₹{Number(item.price).toFixed(2)} each</span></span><span><button className="btn btn-secondary" onClick={() => change(item.productId, -1)}>−</button> {item.cartQuantity} <button className="btn btn-secondary" onClick={() => change(item.productId, 1)}>+</button></span></div>)}
      <label className="field"><span className="label">Discount amount</span><input className="input" type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /></label>
      <label className="field"><span className="label">Payment method</span><select className="select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option></select></label>
      <label className="field"><span className="label">Customer (optional)</span><select className="select" value={customerId || ""} onChange={(event) => setCustomerId(event.target.value ? Number(event.target.value) : null)}><option value="">Walk-in customer</option>{customers.map((customer) => <option key={customer.customerId} value={customer.customerId}>{customer.name} · {customer.phone}</option>)}</select></label>
      <div><strong>Subtotal: ₹{subtotal.toFixed(2)}</strong><div className="metadata">Final total includes 5% tax after discount.</div></div>
      {message && <p role="status" className={message.startsWith("Sale complete") ? "positive" : "field-error"}>{message}</p>}
      <button className="btn btn-primary" disabled={cart.length === 0} onClick={() => void completeSale()}>Complete sale</button>
    </div></section>
  </div>;
}
