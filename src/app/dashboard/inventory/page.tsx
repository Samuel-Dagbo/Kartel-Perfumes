"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, CheckCircle, Archive } from "lucide-react";
import InventoryTable from "@/components/dashboard/InventoryTable";
import { DashboardTableSkeleton } from "@/components/ui/Skeleton";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?all=true");
      const data = await res.json();
      setProducts(data.products ?? data ?? []);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const statCards = [
    { label: "Total Products", value: totalProducts, icon: Package, color: "text-gold-dark", bg: "bg-gold/10" },
    { label: "Active", value: activeProducts, icon: CheckCircle, color: "text-sage", bg: "bg-sage/10" },
    { label: "Low Stock", value: lowStock, icon: AlertTriangle, color: "text-rosegold", bg: "bg-rosegold/10" },
    { label: "Out of Stock", value: outOfStock, icon: Archive, color: "text-charcoal/50", bg: "bg-mist/50" },
  ];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal via-charcoal-light to-ebony p-8 md:p-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-2.5 bg-gold/15 rounded-xl backdrop-blur shrink-0">
            <Package className="w-5 h-5 text-gold-light" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-white">Inventory</h1>
            <p className="text-sm text-white/40 mt-1">
              Manage your perfume collection, stock levels, and pricing
            </p>
          </div>
        </div>
      </div>

      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {statCards.map((card, i) => (
            <div key={card.label} className="bg-white rounded-2xl border border-mist/40 p-5 card-shadow hover:border-gold/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${card.bg} rounded-xl`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-serif text-charcoal">{card.value}</p>
              <p className="text-[10px] text-charcoal/40 tracking-wider uppercase font-medium mt-1">{card.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-6 border border-mist/40 shadow-sm">
          <DashboardTableSkeleton rows={5} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent pointer-events-none" />
          <InventoryTable products={products} onRefresh={fetchProducts} />
        </motion.div>
      )}
    </div>
  );
}
