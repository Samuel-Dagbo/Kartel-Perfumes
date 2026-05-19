"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Heart, Eye, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";
import { useState } from "react";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images: string[];
    concentration: string;
    volume: number;
    stock: number;
  };
  index?: number;
}

const gradients = [
  "linear-gradient(145deg, #0f0c29, #302b63, #24243e)",
  "linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)",
  "linear-gradient(145deg, #2c3e50, #4ca1af, #c3e8e8)",
  "linear-gradient(145deg, #20002c, #6b1d4f, #c0392b)",
  "linear-gradient(145deg, #1f1c2c, #928dab, #1f1c2c)",
  "linear-gradient(145deg, #2b1b3d, #4a2c5e, #1a0a2e)",
  "linear-gradient(145deg, #0d131a, #1a2634, #2c3e50)",
  "linear-gradient(145deg, #1a0a2e, #3a1c5e, #5c2d8a)",
  "linear-gradient(145deg, #0a1628, #1a2d4a, #2a4a6a)",
  "linear-gradient(145deg, #1c0a0a, #3a1a1a, #5c2a2a)",
  "linear-gradient(145deg, #0a1a0a, #1a3a1a, #2a5a2a)",
  "linear-gradient(145deg, #1a1a0a, #3a3a1a, #5a5a2a)",
  "linear-gradient(145deg, #0a0a1a, #1a1a3a, #2a2a5a)",
  "linear-gradient(145deg, #1a0010, #3a0020, #5a0030)",
  "linear-gradient(145deg, #00101a, #00203a, #00305a)",
  "linear-gradient(145deg, #10001a, #20003a, #40005a)",
  "linear-gradient(145deg, #001a10, #003a20, #005a30)",
  "linear-gradient(145deg, #1a1000, #3a2000, #5a4000)",
  "linear-gradient(145deg, #1a0010, #2a0020, #3a0030)",
];

const accentColors = [
  "#c9953a", "#e8d5a0", "#b76e79", "#8a9a8a",
  "#c9953a", "#a67c2e", "#d4a574", "#7a8a7a",
  "#c9953a", "#b8965a", "#c07868", "#6a8a6a",
  "#c9953a", "#a08050", "#b08070", "#5a7a5a",
  "#c9953a", "#e8d5a0", "#c09080", "#8a9a8a",
];

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const g = gradients[index % gradients.length];
  const accent = accentColors[index % accentColors.length];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error("This item is currently out of stock");
      return;
    }
    addItem({
      productId: product._id, name: product.name, price: product.price,
      image: product.images[0], volume: product.volume,
    });
    toast.success(`${product.name} added to cart`);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl mb-3 sm:mb-5 bg-surface card-shadow card-shadow-hover">
          <div className="absolute inset-0" style={{ background: g }} />
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out ${isHovered ? "scale-110" : "scale-100"}`}
            style={{ backgroundImage: `url(${product.images[0]})` }}
          />
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-mist/60 via-mist/30 to-mist/60 animate-pulse" />
          )}
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0"
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent z-10" />

          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex gap-1.5 sm:gap-2">
            {product.originalPrice && (
              <span className="bg-gold text-white text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg rounded-md">
                -{discount}%
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="bg-rosegold/90 text-white text-[9px] sm:text-[10px] font-medium tracking-wider uppercase px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-sm shadow-lg rounded-md">
                Low Stock
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-ebony/80 text-white/60 text-[9px] sm:text-[10px] font-medium tracking-wider uppercase px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-sm shadow-lg rounded-md">
                Sold Out
              </span>
            )}
          </div>

          <motion.button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
              toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist", {
                icon: isWishlisted ? "♡" : "♥",
              });
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.25 }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg glass-dark"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isWishlisted ? "text-rosegold fill-rosegold" : "text-white/80"
              }`}
            />
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10 flex items-center justify-center hidden sm:flex"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: isHovered ? 1 : 0.8 }}
              transition={{ duration: 0.25 }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center glass-dark"
            >
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: isHovered ? "0%" : "100%" }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20"
          >
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full py-2.5 sm:py-3.5 glass-dark text-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-white/15 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg sm:rounded-xl"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {product.stock <= 0 ? "Out of Stock" : "Add to Bag"}
            </button>
          </motion.div>
        </div>

        <div className="space-y-1.5 sm:space-y-2.5 px-0.5">
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
            <motion.span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: accent }}
              animate={{ scale: isHovered ? 1.5 : 1 }}
            />
            <span className="text-[9px] sm:text-[10px] text-charcoal/40 tracking-[0.2em] uppercase font-medium">
              {product.concentration}
            </span>
            <span className="text-[9px] sm:text-[10px] text-charcoal/20">·</span>
            <span className="text-[9px] sm:text-[10px] text-charcoal/30 tracking-wider">
              {product.volume}ml
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-serif text-charcoal leading-snug group-hover:text-gold transition-colors duration-300 tracking-tight line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm sm:text-base font-medium text-charcoal tracking-wide">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] sm:text-xs text-charcoal/30 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
