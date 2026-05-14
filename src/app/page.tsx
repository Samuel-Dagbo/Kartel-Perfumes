import Navbar from "@/components/storefront/Navbar";
import Hero from "@/components/storefront/Hero";
import ProductGrid from "@/components/storefront/ProductGrid";
import CartDrawer from "@/components/storefront/CartDrawer";
import Footer from "@/components/storefront/Footer";
import AboutSection from "@/components/storefront/AboutSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProductGrid />
        <AboutSection />
      </main>
      <CartDrawer />
      <Footer />
    </>
  );
}
