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
        <section className="relative pt-28 pb-8 overflow-hidden bg-ebony">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(184,134,11,0.06),transparent_70%)]" />
          <div className="relative z-10 px-6 sm:px-8 lg:px-10 w-full">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-gold/50 font-medium mb-4">
                Since 2024
              </span>
              <h1 className="text-[clamp(2rem,6vw,4.5rem)] font-serif text-white leading-[0.9] tracking-tight mb-4">
                The Art of
                <br />
                <span className="shimmer-text">Fragrance</span>
              </h1>
              <p className="text-white/30 text-sm max-w-md mx-auto font-light leading-relaxed">
                Each bottle is a study in contrasts — light and shadow, tradition and innovation.
              </p>
            </div>
          </div>
        </section>

        <ProductGrid showHeader={false} />
      </main>
      <CartDrawer />
      <Footer />
    </>
  );
}
