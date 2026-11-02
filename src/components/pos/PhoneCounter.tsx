"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export function PhoneCounter({ storeId, paused, onScan }: { storeId: number; paused: boolean; onScan: (sku: string) => void }) {
  const [counterName, setCounterName] = useState("Counter 1");
  const [code, setCode] = useState("");
  const [scannerUrl, setScannerUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const seen = useRef(new Set<string>());
  const handler = useRef(onScan); handler.current = onScan;
  const pause = useRef(paused); pause.current = paused;

  useEffect(() => {
    if (!scannerUrl || !canvas.current) return;
    void QRCode.toCanvas(canvas.current, scannerUrl, { width: 180, margin: 2 });
  }, [scannerUrl]);

  useEffect(() => {
    if (!code) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        if (!pause.current) {
          const response = await fetch(`/api/scanner?code=${code}`, { signal: controller.signal, cache: "no-store" });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Counter connection failed.");
          if (controller.signal.aborted || pause.current) return;
          for (const event of result.events as { eventId: string; sku: string }[]) {
            if (seen.current.has(event.eventId)) continue;
            handler.current(event.sku); seen.current.add(event.eventId);
          }
          setCount(seen.current.size); setError("");
        }
      } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Counter connection failed."); }
      finally { if (!controller.signal.aborted) timer = setTimeout(poll, 800); }
    }
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [code]);

  async function connect() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/scanner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "open", storeId, counterName }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Counter could not be opened.");
      seen.current.clear(); setCount(0); setCode(result.code); setScannerUrl(result.scannerUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Counter could not be opened."); }
    finally { setBusy(false); }
  }

  async function disconnect() {
    setBusy(true);
    try {
      const response = await fetch(`/api/scanner?code=${code}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not disconnect. Try again.");
      setCode(""); setScannerUrl(""); seen.current.clear(); setCount(0); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Disconnect failed."); }
    finally { setBusy(false); }
  }

  return <section className="surface panel" style={{ display: "grid", gap: 12, marginBottom: 24 }}>
    <h2>Phone scanner</h2>
    {!code ? <><label className="field"><span className="label">Counter name</span><input className="input" value={counterName} maxLength={60} onChange={(event) => setCounterName(event.target.value)} /></label><button className="btn btn-secondary" disabled={busy || !counterName.trim()} onClick={() => void connect()}>Connect phone scanner</button></> : <>
      <p><strong>{counterName}</strong> · Store {storeId}<br />Counter code: <strong style={{ overflowWrap: "anywhere" }}>{code}</strong></p>
      <canvas ref={canvas} role="img" aria-label="QR code to open the phone scanner" />
      <p>On the same Wi-Fi, open <a href={scannerUrl} target="_blank" rel="noreferrer">{scannerUrl}</a> on the phone and enter the counter code. Expires in one hour.</p>
      <p className="metadata">{count} scan signals received. Each adds one unit up to available stock. Scans wait while checkout is processing.</p>
      <button className="btn btn-secondary" disabled={busy || paused} onClick={() => void disconnect()}>Disconnect phone</button>
    </>}
    {error && <p className="field-error" role="alert">{error}</p>}
    <a href="/barcodes" target="_blank" rel="noreferrer">Open / print product barcode labels</a>
  </section>;
}
