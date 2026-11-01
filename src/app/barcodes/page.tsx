import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listProducts } from "@/lib/services/products";
import { BarcodeLabels } from "@/components/pos/BarcodeLabels";

export default async function BarcodesPage() {
  if (!(await getSession())) redirect("/login");
  return <main className="page"><BarcodeLabels products={await listProducts()} /></main>;
}
