import Navbar from "@/components/storefront/Navbar";
import Hero from "@/components/storefront/Hero";
import ProductGrid from "@/components/storefront/ProductGrid";
import CartDrawer from "@/components/storefront/CartDrawer";
import Footer from "@/components/storefront/Footer";
import AboutSection from "@/components/storefront/AboutSection";
import { getFeaturedProductImages } from "@/lib/about-images";

export default async function Home() {
  const productImages = await getFeaturedProductImages(10);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProductGrid />
        <AboutSection productImages={productImages} />
      </main>
      <CartDrawer />
      <Footer />
    </>
  );
}
