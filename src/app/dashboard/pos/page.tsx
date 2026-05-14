"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Store, Package, DollarSign, Clock } from "lucide-react";
import POSInterface from "@/components/dashboard/POSInterface";

export default function POSPage() {
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProductCount(data.products?.length ?? data?.length ?? 0))
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal via-charcoal-light to-ebony p-8 md:p-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-2.5 bg-gold/15 rounded-xl backdrop-blur shrink-0">
            <Store className="w-5 h-5 text-gold-light" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-white">POS Terminal</h1>
            <p className="text-sm text-white/40 mt-1">
              In-store point-of-sale with real-time inventory sync
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-6 mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-white/40">
            <Package className="w-3.5 h-3.5" />
            <span className="text-xs">{productCount} products available</span>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-xs">GHS</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <POSInterface />
      </motion.div>
    </div>
  );
}
