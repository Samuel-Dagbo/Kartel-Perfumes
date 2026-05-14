"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import OrderTable from "@/components/dashboard/OrderTable";
import { DashboardTableSkeleton } from "@/components/ui/Skeleton";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
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

  const pending = orders.filter((o) => o.status === "pending").length;
  const processing = orders.filter((o) => o.status === "processing" || o.status === "confirmed").length;
  const shipped = orders.filter((o) => o.status === "shipped").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;

  const statCards = [
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Processing", value: processing, icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Delivered", value: delivered, icon: CheckCircle, color: "text-sage", bg: "bg-sage/10" },
    { label: "Cancelled", value: cancelled, icon: XCircle, color: "text-rosegold", bg: "bg-rosegold/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal via-charcoal-light to-ebony p-8 md:p-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-2.5 bg-gold/15 rounded-xl backdrop-blur shrink-0">
            <ShoppingCart className="w-5 h-5 text-gold-light" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-white">Orders</h1>
            <p className="text-sm text-white/40 mt-1">
              Track and manage online orders — {orders.length} total
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
          <OrderTable orders={orders} onRefresh={fetchOrders} />
        </motion.div>
      )}
    </div>
  );
}
