"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Filter, Grid3X3, List } from "lucide-react";

interface IProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  concentration: string;
  volume: number;
  stock: number;
  gender?: string;
}

const categories = ["All", "Eau de Parfum", "Extrait de Parfum"];

interface ProductGridProps {
  showHeader?: boolean;
}

export default function ProductGrid({ showHeader = true }: ProductGridProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products ?? data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => p.concentration === activeCategory);

  if (loading) {
    return (
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-gold/40" />
            <span className="text-gold tracking-[0.25em] text-xs uppercase font-medium">Curated Selection</span>
            <span className="w-8 h-px bg-gold/40" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-charcoal mb-6 tracking-tight">
            The Collection
          </h2>
          <div className="w-12 h-px bg-gold/30 mx-auto mb-8" />
          <p className="text-charcoal/40 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
            Each fragrance is a masterwork of olfactory artistry, crafted with the
            finest ingredients from around the world.
          </p>
        </motion.div>
      )}

      {/* Category Filters + View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-xs tracking-[0.15em] uppercase rounded-xl border transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-charcoal text-white border-charcoal shadow-md"
                  : "bg-transparent text-charcoal/50 border-mist/60 hover:border-charcoal/30 hover:text-charcoal"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-mist/40 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-charcoal text-white shadow-sm" : "text-charcoal/40 hover:text-charcoal"}`}
            aria-label="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-charcoal text-white shadow-sm" : "text-charcoal/40 hover:text-charcoal"}`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-6 bg-mist/50 rounded-full flex items-center justify-center">
            <Filter className="w-8 h-8 text-charcoal/20" />
          </div>
          <p className="text-charcoal/30 text-sm">No products in this category yet.</p>
          {activeCategory !== "All" && (
            <button onClick={() => setActiveCategory("All")} className="text-gold text-xs mt-2 hover:underline">
              View all products
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filtered.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
