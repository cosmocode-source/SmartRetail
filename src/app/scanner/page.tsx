"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { IScannerControls } from "@zxing/browser";

function eventId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function ScannerPage() {
  const [code, setCode] = useState("");
  const [counter, setCounter] = useState("");
  const [sku, setSku] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls>();
  const sending = useRef(false);
  const generation = useRef(0);

  function stop() { generation.current += 1; controls.current?.stop(); controls.current = undefined; setCamera(false); }
  useEffect(() => () => { generation.current += 1; controls.current?.stop(); }, []);

  async function request(body: object) {
    const response = await fetch("/api/scanner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not contact the counter.");
    return result;
  }

  async function pair(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { const result = await request({ action: "pair", code }); setCounter(result.counterName); setMessage(`Connected to ${result.counterName} · Store ${result.storeId}`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Connection failed."); }
    finally { setBusy(false); }
  }

  async function send(value: string) {
    if (sending.current) return;
    sending.current = true; setBusy(true); setError(""); setMessage(""); setSku(value);
    try {
      const result = await request({ action: "scan", code, sku: value, eventId: eventId() });
      setMessage(`Sent 1 × ${result.productName} to ${result.counterName}. Check the POS cart for stock limits.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Scan was not sent. Try again."); }
    finally { sending.current = false; setBusy(false); }
  }

  async function startCamera() {
    stop(); setError(""); setMessage("");
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError("Live camera needs HTTPS. Use Take barcode photo below on a local HTTP connection."); return;
    }
    setCamera(true);
    const current = generation.current;
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      let detected = false;
      const scanner = await new BrowserMultiFormatReader().decodeFromConstraints(
        { video: { facingMode: "environment" }, audio: false }, video.current!,
        (result, _error, readerControls) => {
          if (!result || detected || current !== generation.current) return;
          detected = true; readerControls.stop(); setCamera(false); void send(result.getText());
        }
      );
      if (current !== generation.current || detected) scanner.stop(); else controls.current = scanner;
    } catch { if (current === generation.current) { setCamera(false); setError("Camera unavailable. Allow camera permission or take a barcode photo."); } }
  }

  async function readPhoto(file?: File) {
    if (!file) return;
    stop(); setBusy(true); setError(""); setMessage("");
    const url = URL.createObjectURL(file);
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const result = await new BrowserMultiFormatReader().decodeFromImageUrl(url);
      await send(result.getText());
    } catch { setError("Barcode could not be read. Keep all bars in the photo, use good light, and try again."); }
    finally { URL.revokeObjectURL(url); setBusy(false); }
  }

  return <main className="page" style={{ maxWidth: 640, margin: "0 auto", display: "grid", gap: 24 }}>
    <h1>Counter barcode scanner</h1>
    {!counter ? <form className="surface panel" onSubmit={pair} style={{ display: "grid", gap: 16 }}>
      <p>Enter the counter code shown under Phone scanner on the POS laptop.</p>
      <label className="field"><span className="label">Counter code</span><input className="input" value={code} onChange={(event) => setCode(event.target.value)} autoCapitalize="characters" autoComplete="off" required maxLength={24} /></label>
      <button className="btn btn-primary" disabled={busy}>Connect to counter</button>
    </form> : <section className="surface panel" style={{ display: "grid", gap: 16 }}>
      <h2>{counter}</h2><p>Each scan sends one unit. Choose Scan next for another unit or product.</p>
      <video ref={video} autoPlay muted playsInline hidden={!camera} style={{ width: "100%", maxHeight: 320 }} />
      <button className="btn btn-primary" disabled={busy || camera} onClick={() => void startCamera()}>Scan next with camera</button>
      {camera && <button className="btn btn-secondary" onClick={stop}>Stop camera</button>}
      <label className="field"><span className="label">Take barcode photo or choose image</span><input className="input" type="file" accept="image/*" capture="environment" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; void readPhoto(file); }} /></label>
      <form onSubmit={(event) => { event.preventDefault(); stop(); void send(sku.trim()); }} style={{ display: "grid", gap: 12 }}><label className="field"><span className="label">SKU / barcode text (manual fallback)</span><input className="input" value={sku} onChange={(event) => setSku(event.target.value)} required maxLength={64} /></label><button className="btn btn-secondary" disabled={busy}>Send one unit</button></form>
      <button className="btn btn-secondary" disabled={busy} onClick={() => { stop(); setCounter(""); setMessage(""); setError(""); }}>Change counter</button>
    </section>}
    {busy && <p role="status">Processing…</p>}{message && <p className="positive" role="status">{message}</p>}{error && <p className="field-error" role="alert">{error}</p>}
  </main>;
}
