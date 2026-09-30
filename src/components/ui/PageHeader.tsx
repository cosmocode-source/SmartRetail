export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return <header className="page-header"><div><h1>{title}</h1><p className="muted">{description}</p></div>{actions && <div className="page-actions">{actions}</div>}</header>;
}
