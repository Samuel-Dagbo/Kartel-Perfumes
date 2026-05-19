"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Filter, Grid3X3, List, Search, X } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products ?? data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.concentration === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
            <span className="w-6 sm:w-8 h-px bg-gold/40" />
            <span className="text-gold tracking-[0.25em] text-[10px] sm:text-xs uppercase font-medium">Curated Selection</span>
            <span className="w-6 sm:w-8 h-px bg-gold/40" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-charcoal mb-4 sm:mb-6 tracking-tight">
            The Collection
          </h2>
          <div className="w-10 sm:w-12 h-px bg-gold/30 mx-auto mb-6 sm:mb-8" />
          <p className="text-charcoal/40 text-xs sm:text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed px-4 sm:px-0">
            Each fragrance is a masterwork of olfactory artistry, crafted with the
            finest ingredients from around the world.
          </p>
        </motion.div>
      )}

      {/* Search + Filters Bar */}
      <div className="mb-8 sm:mb-10 space-y-4 sm:space-y-5">
        {/* Search */}
        <div className="relative max-w-md mx-auto sm:mx-0">
          <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/25" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fragrances..."
            className="w-full pl-10 sm:pl-12 pr-9 sm:pr-10 py-2.5 sm:py-3 bg-white border border-mist/60 rounded-xl text-xs sm:text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-mist/50 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 text-charcoal/25" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs tracking-[0.15em] uppercase rounded-lg sm:rounded-xl border transition-all duration-300 whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-charcoal text-white border-charcoal shadow-md"
                    : "bg-transparent text-charcoal/50 border-mist/60 hover:border-charcoal/30 hover:text-charcoal"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] sm:text-xs text-charcoal/30 tracking-wide">
              {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white rounded-lg sm:rounded-xl border border-mist/40 p-0.5 sm:p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${viewMode === "grid" ? "bg-charcoal text-white shadow-sm" : "text-charcoal/40 hover:text-charcoal"}`}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${viewMode === "list" ? "bg-charcoal text-white shadow-sm" : "text-charcoal/40 hover:text-charcoal"}`}
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 sm:py-24">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-mist/50 rounded-full flex items-center justify-center">
            <Filter className="w-6 h-6 sm:w-8 sm:h-8 text-charcoal/20" />
          </div>
          <p className="text-charcoal/30 text-xs sm:text-sm">No products match your search.</p>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-gold text-[11px] sm:text-xs mt-2 hover:underline">
              Clear search
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 lg:gap-8">
          {filtered.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filtered.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
