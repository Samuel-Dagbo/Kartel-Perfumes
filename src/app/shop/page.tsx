import { Metadata } from "next";
import Navbar from "@/components/storefront/Navbar";
import ProductGrid from "@/components/storefront/ProductGrid";
import CartDrawer from "@/components/storefront/CartDrawer";
import Footer from "@/components/storefront/Footer";
import { Sparkles, Gem, FlaskConical, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop | Kartel",
  description: "Browse our complete collection of luxury artisan fragrances.",
};

const features = [
  { icon: Gem, label: "Premium Ingredients" },
  { icon: FlaskConical, label: "Expertly Blended" },
  { icon: Sparkles, label: "Limited Batches" },
  { icon: Star, label: "Luxury Craft" },
];

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 md:pb-28 px-5 sm:px-8 lg:px-10 overflow-hidden bg-gradient-to-b from-ebony via-ebony to-ivory">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(184,134,11,0.08),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(184,134,11,0.05),transparent_60%)] pointer-events-none" />

          <div className="absolute top-0 left-1/4 w-px h-32 sm:h-48 bg-gradient-to-b from-gold/20 to-transparent hidden sm:block" />
          <div className="absolute top-0 right-1/4 w-px h-32 sm:h-48 bg-gradient-to-b from-gold/20 to-transparent hidden sm:block" />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-3 px-4 sm:px-5 py-2 rounded-full border border-gold/15 bg-gold/5 backdrop-blur-sm mb-6 sm:mb-8">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-light/60" />
                <span className="text-gold-light/60 tracking-[0.25em] text-[9px] sm:text-[10px] uppercase font-medium">
                  The Complete Collection
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-4 sm:mb-6 tracking-tight leading-[0.9]">
                All{" "}
                <span className="shimmer-text">Fragrances</span>
              </h1>

              <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto mb-4 sm:mb-6" />

              <p className="text-white/40 text-xs sm:text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed px-2 sm:px-0">
                Explore our complete universe of luxury fragrances, each one a masterwork of olfactory artistry.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center justify-center gap-4 sm:gap-8 md:gap-12 mt-10 sm:mt-14 max-w-md sm:max-w-none mx-auto">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2 sm:gap-2.5 justify-center">
                  <f.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-light/30 shrink-0" />
                  <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium whitespace-nowrap">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="relative">
          <div className="absolute inset-x-0 -top-px h-16 sm:h-32 bg-gradient-to-b from-ebony to-transparent pointer-events-none" />
          <ProductGrid showHeader={false} />
        </div>
      </main>
      <CartDrawer />
      <Footer />
    </>
  );
}
