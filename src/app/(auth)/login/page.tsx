export default function LoginPage() {
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
    <section className="surface panel" style={{ width: "min(100%, 420px)" }} aria-labelledby="login-title">
      <div className="brand" style={{ padding: 0, marginBottom: 32 }}><span className="brand-mark">SR</span><span>SmartRetail</span></div>
      <h1 id="login-title">Sign in</h1><p className="muted">Use your staff account to access retail operations.</p>
      <form style={{ display: "grid", gap: 16, marginTop: 24 }}>
        <label className="field"><span className="label">Email</span><input className="input" type="email" autoComplete="email" required /></label>
        <label className="field"><span className="label">Password</span><input className="input" type="password" autoComplete="current-password" required /></label>
        <button className="btn btn-primary" type="submit">Sign in</button>
      </form>
    </section>
  </main>;
}
