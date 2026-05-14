"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import OrderTable from "@/components/dashboard/OrderTable";
import { DashboardTableSkeleton } from "@/components/ui/Skeleton";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders ?? data ?? []);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal via-charcoal-light to-ebony p-8 md:p-10 mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-2.5 bg-gold/15 rounded-xl backdrop-blur shrink-0">
            <ShoppingCart className="w-5 h-5 text-gold-light" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-white">Orders</h1>
            <p className="text-sm text-white/40 mt-1">
              Track and manage online orders
            </p>
          </div>
        </div>
      </div>

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
          <OrderTable orders={orders} onRefresh={fetchOrders} />
        </motion.div>
      )}
    </div>
  );
}
