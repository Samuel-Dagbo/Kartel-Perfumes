"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Filter, Search, X, SlidersHorizontal } from "lucide-react";

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

const categories = [
  { id: "all", label: "All", slug: "all" },
  { id: "eau-de-parfum", label: "Eau de Parfum", slug: "Eau de Parfum" },
  { id: "extrait-de-parfum", label: "Extrait de Parfum", slug: "Extrait de Parfum" },
];

interface ProductGridProps {
  showHeader?: boolean;
}

export default function ProductGrid({ showHeader = true }: ProductGridProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
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

  const activeCat = categories.find((c) => c.id === activeCategory);
  const concentrationFilter = activeCat?.slug;

  const filtered = products.filter((p) => {
    const matchesCategory = concentrationFilter === "all" || p.concentration === concentrationFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedByCategory = categories.slice(1).map((cat) => ({
    ...cat,
    products: products.filter(
      (p) => p.concentration === cat.slug && p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  if (loading) {
    return (
      <section className="py-16 sm:py-24 md:py-28 px-5 sm:px-8 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 md:py-28 px-5 sm:px-8 lg:px-10 max-w-7xl mx-auto">
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12 sm:mb-16"
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

      {/* Toolbar */}
      <div className="mb-10 sm:mb-14 space-y-5">
        {/* Search */}
        <div className="relative max-w-md mx-auto sm:mx-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/25" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fragrances..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-mist/60 rounded-xl text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-mist/50 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 text-charcoal/25" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs tracking-[0.2em] uppercase rounded-full border transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-ebony text-white border-ebony shadow-lg shadow-black/10"
                    : "bg-transparent text-charcoal/40 border-mist/60 hover:border-charcoal/20 hover:text-charcoal/70"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] sm:text-xs text-charcoal/25 tracking-wide whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 sm:py-24">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 bg-mist/50 rounded-full flex items-center justify-center">
            <Filter className="w-6 h-6 sm:w-8 sm:h-8 text-charcoal/15" />
          </div>
          <p className="text-charcoal/30 text-sm">No fragrances match your search.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gold text-xs mt-2 hover:underline transition-all"
            >
              Clear search
            </button>
          )}
        </div>
      ) : activeCategory === "all" ? (
        <div className="space-y-16 sm:space-y-20">
          {groupedByCategory.map((group) =>
            group.products.length > 0 ? (
              <div key={group.id} id={group.id} className="scroll-mt-28">
                <div className="flex items-center gap-4 mb-8 sm:mb-10">
                  <div className="h-px flex-1 bg-gradient-to-r from-mist/80 to-transparent" />
                  <h3 className="text-xs sm:text-sm tracking-[0.3em] uppercase text-charcoal/30 font-medium">
                    {group.label}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-mist/80" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 lg:gap-8">
                  {group.products.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 lg:gap-8">
          {filtered.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
