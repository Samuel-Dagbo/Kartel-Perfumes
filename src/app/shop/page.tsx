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
        <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden bg-ebony">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(184,134,11,0.08),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(184,134,11,0.03),transparent_50%)]" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold/10 rounded-full hidden sm:block" />

          <div className="relative z-10 px-6 sm:px-8 lg:px-10 w-full">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-4 sm:mb-6">
                <span className="inline-block text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold-light/50 font-medium">
                  Since 2024
                </span>
              </div>

              <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-serif text-white leading-[0.85] tracking-tight mb-4 sm:mb-6">
                The Art of
                <br />
                <span className="shimmer-text">Fragrance</span>
              </h1>

              <p className="text-white/30 text-xs sm:text-sm md:text-base max-w-md mx-auto font-light leading-relaxed">
                Each bottle is a study in contrasts — light and shadow, tradition and innovation, the familiar and the unexpected.
              </p>

              <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8 sm:mt-12">
                {[
                  { label: "Eau de Parfum", sub: "Eau de Parfum" },
                  { label: "Extrait", sub: "Extrait de Parfum" },
                ].map((cat) => (
                  <a
                    key={cat.label}
                    href={`#${cat.sub.toLowerCase().replace(/\s+/g, "-")}`}
                    className="group text-center"
                  >
                    <span className="block text-[11px] sm:text-xs tracking-[0.25em] uppercase text-white/40 group-hover:text-gold-light transition-colors duration-300">
                      {cat.label}
                    </span>
                    <span className="block w-0 h-px bg-gold/40 mt-2 mx-auto group-hover:w-full transition-all duration-500" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="relative">
          <div className="absolute inset-x-0 -top-px h-24 sm:h-40 bg-gradient-to-b from-ebony to-transparent pointer-events-none" />
          <ProductGrid showHeader={false} />
        </div>
      </main>
      <CartDrawer />
      <Footer />
    </>
  );
}
