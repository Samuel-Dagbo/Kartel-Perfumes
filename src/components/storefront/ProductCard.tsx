"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";
import { useState, useSyncExternalStore } from "react";

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
];

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const g = gradients[index % gradients.length];
  const hasImage = product.images && product.images[0]?.startsWith("http");

  const isTouchDevice = useSyncExternalStore(
    () => () => {},
    () => typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0),
    () => false
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error("This item is currently out of stock");
      return;
    }
    addItem({
      productId: product._id, name: product.name, price: product.price,
      image: product.images[0] || "", volume: product.volume,
    });
    toast.success(`${product.name} added to cart`);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const showOverlay = isHovered || isTouchDevice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-3 sm:mb-4">
          {/* Background gradient (shown when no image or as base) */}
          <div className="absolute inset-0" style={{ background: g }} />

          {/* Product image */}
          {hasImage && (
            <>
              <div
                className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
                style={{ backgroundImage: `url(${product.images[0]})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </>
          )}

          {/* Overlay on hover */}
          <div className={`absolute inset-0 transition-colors duration-300 ${showOverlay ? "bg-black/10" : "bg-black/0"}`} />

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex gap-1.5">
            {discount > 0 && (
              <span className="bg-gold text-white text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-md shadow-lg">
                -{discount}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-ebony/80 text-white/60 text-[9px] font-medium tracking-wider uppercase px-2 py-1 rounded-md backdrop-blur-sm">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
              toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist", {
                icon: isWishlisted ? "♡" : "♥",
              });
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: showOverlay ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isWishlisted ? "text-rosegold fill-rosegold" : "text-white/80"
              }`}
            />
          </motion.button>

          {/* Add to cart — always reachable on touch devices */}
          <motion.div
            initial={false}
            animate={{
              y: isTouchDevice ? "0%" : isHovered ? "0%" : "100%",
            }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute bottom-0 left-0 right-0 p-3 z-10"
          >
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full py-2.5 bg-white/90 backdrop-blur text-charcoal text-[10px] tracking-wider uppercase font-medium hover:bg-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg shadow-lg"
            >
              <ShoppingBag className="w-3 h-3" />
              {product.stock <= 0 ? "Out of Stock" : "Add to Bag"}
            </button>
          </motion.div>
        </div>

        <div className="space-y-1.5 px-0.5">
          <div className="flex items-center gap-2 text-[10px] text-charcoal/40 tracking-wider uppercase">
            <span>{product.concentration}</span>
            <span className="text-charcoal/20">·</span>
            <span>{product.volume}ml</span>
          </div>
          <h3 className="text-sm font-serif text-charcoal leading-snug group-hover:text-gold transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-charcoal/30 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-[10px] text-rosegold/60">Only {product.stock} left</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
