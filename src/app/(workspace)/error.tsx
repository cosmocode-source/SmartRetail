"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="main"><div className="page"><section className="surface panel"><h1>Something went wrong</h1><p className="muted">The requested data could not be loaded. Check the database services and try again.</p><button className="btn btn-primary" onClick={reset}>Try again</button></section></div></main>;
}
