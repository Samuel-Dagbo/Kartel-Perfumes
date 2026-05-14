"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ShoppingBag, Heart, Shield, Truck, RotateCcw, Check,
  Star, Maximize2,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";
import Navbar from "@/components/storefront/Navbar";
import CartDrawer from "@/components/storefront/CartDrawer";
import Footer from "@/components/storefront/Footer";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  concentration: string;
  volume: number;
  gender: string;
  brand: string;
  stock: number;
}

const noteGradients: Record<string, string> = {
  top: "from-amber-200/20 to-yellow-500/10",
  heart: "from-rose-200/20 to-pink-500/10",
  base: "from-purple-200/20 to-indigo-500/10",
};

const noteDots: Record<string, string> = {
  top: "bg-amber-400",
  heart: "bg-rose-400",
  base: "bg-purple-400",
};

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [stickyBar, setStickyBar] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    const onScroll = () => setStickyBar(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
      toast.error("This item is currently out of stock");
      return;
    }
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.jpg",
      volume: product.volume,
    });
    toast.success(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16">
              <div className="aspect-[3/4] bg-mist animate-pulse rounded-2xl" />
              <div className="space-y-6 pt-4">
                <div className="h-4 w-24 bg-mist animate-pulse rounded" />
                <div className="h-10 w-3/4 bg-mist animate-pulse rounded" />
                <div className="h-6 w-32 bg-mist animate-pulse rounded" />
                <div className="h-5 w-full bg-mist animate-pulse rounded" />
                <div className="h-20 w-full bg-mist animate-pulse rounded" />
                <div className="h-12 w-48 bg-mist animate-pulse rounded" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-mist/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-charcoal/20" />
            </div>
            <h1 className="text-2xl font-serif mb-4">Product Not Found</h1>
            <Link href="/" className="text-gold hover:underline text-sm">
              Return to Collection
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 hover:text-charcoal transition-colors duration-200 mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Collection
          </Link>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {/* Left - Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div
                className="aspect-[3/4] bg-mist rounded-2xl overflow-hidden relative shadow-xl group cursor-crosshair"
                onClick={() => setShowZoom(true)}
              >
                <motion.div
                  className="w-full h-full bg-cover bg-center transition-all duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${product.images[selectedImage] || "/placeholder.jpg"})`,
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-white/80 backdrop-blur rounded-xl shadow-lg">
                    <Maximize2 className="w-4 h-4 text-charcoal/60" />
                  </div>
                </div>
                {product.originalPrice && (
                  <span className="absolute top-5 left-5 bg-gradient-to-r from-gold-dark to-gold text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-lg shadow-lg">
                    Sale
                  </span>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-white text-sm tracking-[0.2em] uppercase font-medium">Currently Unavailable</span>
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 bg-mist rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === i ? "border-gold shadow-md shadow-gold/20" : "border-transparent hover:border-mist"
                      }`}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right - Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <p className="text-gold text-xs tracking-[0.2em] uppercase mb-3 font-medium">
                  {product.brand}
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal leading-tight">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-4xl md:text-5xl font-serif text-charcoal">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-charcoal/40 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xs text-rosegold font-medium bg-rosegold/10 px-2.5 py-1 rounded-full">
                    Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-charcoal/60 tracking-wider uppercase flex-wrap">
                <span className="bg-mist/60 px-3 py-1.5 rounded-lg">{product.concentration}</span>
                <span className="text-charcoal/20">|</span>
                <span className="bg-mist/60 px-3 py-1.5 rounded-lg">{product.volume}ml</span>
                <span className="text-charcoal/20">|</span>
                <span className="bg-mist/60 px-3 py-1.5 rounded-lg capitalize">{product.gender}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {product.stock > 0 ? (
                  <>
                    <div className="p-0.5 bg-sage/20 rounded-full">
                      <Check className="w-3.5 h-3.5 text-sage" />
                    </div>
                    <span className="text-sage font-medium">In Stock</span>
                    {product.stock <= 5 && (
                      <span className="text-rosegold/70 ml-2">(Only {product.stock} left)</span>
                    )}
                  </>
                ) : (
                  <span className="text-rosegold/70">Out of Stock</span>
                )}
              </div>

              <p className="text-charcoal/60 text-sm leading-relaxed border-l-2 border-gold/20 pl-5">
                {product.description}
              </p>

              {/* Scent Profile */}
              <div className="space-y-5">
                <h3 className="text-xs tracking-widest uppercase text-charcoal/70 font-medium">
                  Scent Profile
                </h3>

                {[
                  { label: "Top Notes", notes: product.scentNotes.top, key: "top" },
                  { label: "Heart Notes", notes: product.scentNotes.heart, key: "heart" },
                  { label: "Base Notes", notes: product.scentNotes.base, key: "base" },
                ].map(({ label, notes, key }) => (
                  <div key={label} className={`bg-gradient-to-r ${noteGradients[key]} rounded-xl p-4 border border-mist/30`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${noteDots[key]}`} />
                      <p className="text-xs text-charcoal/50 font-medium">{label}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {notes.map((note) => (
                        <span
                          key={note}
                          className="px-4 py-1.5 bg-white/60 backdrop-blur rounded-full text-xs text-charcoal/60 border border-mist/30 shadow-sm"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  variant="premium"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  icon={<ShoppingBag className="w-4 h-4" />}
                >
                  {product.stock <= 0 ? "Out of Stock" : "Add to Bag"}
                </Button>
                <Button variant="outline" size="lg" icon={<Heart className="w-4 h-4" />}>
                  Wishlist
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-5 pt-6 border-t border-mist/40">
                {[
                  { icon: Truck, label: "Free Shipping", sub: "On orders over $200" },
                  { icon: Shield, label: "Secure", sub: "Protected payment" },
                  { icon: RotateCcw, label: "Returns", sub: "30-day returns" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="text-center group">
                    <div className="w-12 h-12 bg-mist/40 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-gold/5 group-hover:scale-105 transition-all duration-300">
                      <Icon className="w-5 h-5 text-charcoal/40 group-hover:text-gold-dark transition-colors" />
                    </div>
                    <p className="text-xs font-medium text-charcoal/60">{label}</p>
                    <p className="text-[10px] text-charcoal/30 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Sticky Add to Cart Bar */}
      <AnimatePresence>
        {stickyBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-mist/60 z-30 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-14 bg-mist rounded-xl overflow-hidden shrink-0">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${product.images[0]})` }}
                  />
                </div>
                <div>
                  <p className="text-sm font-serif text-charcoal">{product.name}</p>
                  <p className="text-lg font-serif text-gold">{formatPrice(product.price)}</p>
                </div>
              </div>
              <Button
                variant="premium"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                icon={<ShoppingBag className="w-4 h-4" />}
              >
                {product.stock <= 0 ? "Out of Stock" : "Add to Bag"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {showZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={() => setShowZoom(false)}
          >
            <button
              onClick={() => setShowZoom(false)}
              className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors z-10"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-3xl max-h-[90vh] w-full h-full"
            >
              <div
                className="w-full h-full bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${product.images[selectedImage]})` }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
      <Footer />
    </>
  );
}
