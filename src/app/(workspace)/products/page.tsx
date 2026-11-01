import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductManager } from "@/components/products/ProductManager";
import { listCategories, listProducts } from "@/lib/services/products";
import { getSession } from "@/lib/auth/session";

export default async function Page() {
  const [products, categories, user] = await Promise.all([listProducts(), listCategories(), getSession()]);
  return <AppShell current="/products"><div className="page">
    <PageHeader title="Products" description="Maintain product records, categories, pricing, and active status." />
    <p><a href="/barcodes" target="_blank" rel="noreferrer">Open / print barcode labels for all products</a></p>
    <ProductManager initialProducts={products} categories={categories} canManage={user?.role === "admin"} />
  </div></AppShell>;
}
