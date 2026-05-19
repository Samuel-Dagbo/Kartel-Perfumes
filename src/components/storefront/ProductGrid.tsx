"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Search, X } from "lucide-react";

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

interface ProductGridProps {
  showHeader?: boolean;
}

export default function ProductGrid({ showHeader = true }: ProductGridProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
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

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <section className="py-16 sm:py-24 px-5 sm:px-8 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 px-5 sm:px-8 lg:px-10 max-w-7xl mx-auto">
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-8 h-px bg-gold/30" />
            <span className="text-gold/50 tracking-[0.3em] text-[10px] uppercase font-medium">The Collection</span>
            <span className="w-8 h-px bg-gold/30" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-charcoal tracking-tight">
            Curated Fragrances
          </h2>
          <div className="w-8 h-px bg-gold/20 mx-auto mt-4" />
        </motion.div>
      )}

      {/* Search */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/25" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fragrances..."
            className="w-full pl-11 pr-10 py-2.5 bg-white border border-mist/40 rounded-lg text-sm text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-mist/50 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 text-charcoal/30" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-5 bg-mist/50 rounded-full flex items-center justify-center">
            <Search className="w-6 h-6 text-charcoal/15" />
          </div>
          <p className="text-charcoal/30 text-sm">No fragrances match your search.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gold text-xs mt-2 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {filtered.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-xs text-charcoal/25 tracking-wider">
            {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"}
          </p>
        </motion.div>
      )}
    </section>
  );
}
