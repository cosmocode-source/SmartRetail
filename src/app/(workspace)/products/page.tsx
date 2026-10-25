import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductManager } from "@/components/products/ProductManager";
import { listCategories, listProducts } from "@/lib/services/products";

export default async function Page() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  return <AppShell current="/products"><div className="page">
    <PageHeader title="Products" description="Maintain product records, categories, pricing, and active status." />
    <ProductManager initialProducts={products} categories={categories} />
  </div></AppShell>;
}
