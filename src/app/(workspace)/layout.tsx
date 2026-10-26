import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSession())) redirect("/login");
  return children;
}
