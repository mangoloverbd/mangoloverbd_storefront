import Layout from "@/components/layout";
import ProductGrid from "@/components/product-grid";
import { useStorefront } from "@/contexts/storefront-context";

export default function Home() {
  const { config } = useStorefront();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="px-5 md:px-16 pt-12 md:pt-24 pb-8 md:pb-14">
        <div className="mx-auto max-w-[1440px]">
          {config.tagline && (
            <span className="text-[9px] uppercase tracking-[0.55em] font-medium mb-3 block"
                  style={{ color: config.primaryColor }}>
              {config.tagline}
            </span>
          )}
          <h1 className="text-[2.2rem] md:text-7xl font-display font-light uppercase tracking-tight leading-none">
            {config.storeName || "Our"} <span className="font-bold">Products</span>
          </h1>
        </div>
      </section>

      {/* Hairline divider */}
      <div className="h-px bg-black/10 mx-5 md:mx-16" />

      {/* Product Grid */}
      <ProductGrid />
    </Layout>
  );
}
