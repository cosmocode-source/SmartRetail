"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

function Label({ sku, name }: { sku: string; name: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [qr, setQr] = useState(false);
  useEffect(() => {
    if (/^[\x20-\x7e]+$/.test(sku)) {
      setQr(false);
      JsBarcode(svg.current!, sku, { format: "CODE128", width: 2, height: 64, margin: 12, displayValue: true, fontSize: 16 });
    } else {
      setQr(true);
      void QRCode.toCanvas(canvas.current!, sku, { width: 200, margin: 3 });
    }
  }, [sku]);
  return <article className="barcode-label"><strong>{name}</strong><svg ref={svg} role="img" aria-label={`Barcode for ${sku}`} style={{ display: qr ? "none" : "block", maxWidth: "100%", height: "auto" }} /><canvas ref={canvas} hidden={!qr} role="img" aria-label={`QR barcode for ${sku}`} /><span>{sku}</span></article>;
}

export function BarcodeLabels({ products }: { products: { productId: number; sku: string; name: string }[] }) {
  return <div><div className="no-print"><h1>Product barcode labels</h1><p>Each label encodes the SKU stored in PostgreSQL. Scan a label from the paired phone to add one unit to its POS counter.</p><button className="btn btn-primary" onClick={() => window.print()}>Print labels</button></div><div className="barcode-labels">{products.map((product) => <Label key={product.productId} sku={product.sku} name={product.name} />)}</div>{!products.length && <p>No products yet. Add products first.</p>}</div>;
}
