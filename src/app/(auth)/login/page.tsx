"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) return setError(result.error || "Sign in failed.");
    router.push("/dashboard");
    router.refresh();
  }

  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
    <section className="surface panel" style={{ width: "min(100%, 420px)" }} aria-labelledby="login-title">
      <div className="brand" style={{ padding: 0, marginBottom: 32 }}><span className="brand-mark">SR</span><span>SmartRetail</span></div>
      <h1 id="login-title">Sign in</h1><p className="muted">Use your staff account to access retail operations.</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 16, marginTop: 24 }}>
        <label className="field"><span className="label">Email</span><input className="input" name="email" type="email" autoComplete="email" required /></label>
        <label className="field"><span className="label">Password</span><input className="input" name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p role="alert" style={{ color: "var(--color-error)" }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </section>
  </main>;
}
