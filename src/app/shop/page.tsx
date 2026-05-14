import { Metadata } from "next";
import Navbar from "@/components/storefront/Navbar";
import ProductGrid from "@/components/storefront/ProductGrid";
import CartDrawer from "@/components/storefront/CartDrawer";
import Footer from "@/components/storefront/Footer";

export const metadata: Metadata = {
  title: "Shop | Kartel",
  description: "Browse our complete collection of luxury artisan fragrances.",
};

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative pt-32 pb-16 md:pb-20 px-5 sm:px-8 lg:px-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.02] via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-6 h-px bg-gold/40" />
                <span className="text-gold tracking-[0.25em] text-xs uppercase font-medium">The Complete Collection</span>
                <span className="w-6 h-px bg-gold/40" />
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-charcoal mt-6 mb-6 tracking-tight">
                All Fragrances
              </h1>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto mb-6" />
              <p className="text-charcoal/40 text-sm md:text-base max-w-md mx-auto font-light">
                Explore our complete universe of luxury fragrances, each one a masterwork of olfactory artistry.
              </p>
            </div>
          </div>
        </section>
        <ProductGrid />
      </main>
      <CartDrawer />
      <Footer />
    </>
  );
}
