"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, DollarSign } from "lucide-react";
import SalesTable from "@/components/dashboard/SalesTable";
import { formatPrice } from "@/lib/utils";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sales");
      const data = await res.json();
      setSales(data.sales ?? []);
    } catch {
      console.error("Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const totalRevenue = sales.reduce((sum: number, s: { total: number }) => sum + s.total, 0);

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal via-charcoal-light to-ebony p-8 md:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-gold/15 rounded-xl backdrop-blur shrink-0">
              <ShoppingBag className="w-5 h-5 text-gold-light" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-white">Sales</h1>
              <p className="text-sm text-white/40 mt-1">
                All in-store POS transactions — {sales.length} sale{sales.length !== 1 ? "s" : ""} recorded
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-5 py-3 border border-white/5">
            <DollarSign className="w-5 h-5 text-gold-light/60" />
            <div>
              <p className="text-[9px] text-white/30 tracking-[0.2em] uppercase">Total Revenue</p>
              <p className="text-xl font-serif text-gold-light">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/50 rounded-2xl animate-pulse border border-mist/30" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent pointer-events-none" />
          <SalesTable sales={sales} onRefresh={fetchSales} />
        </motion.div>
      )}
    </div>
  );
}
