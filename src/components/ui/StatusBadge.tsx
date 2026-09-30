type Tone = "success" | "warning" | "error" | "neutral";
export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
