"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Analytics {
  totalRevenue: number;
  totalTransactions: number;
  totalProducts: number;
  totalUsers: number;
  activeUsers: number;
  revenueTrend: number;
  paymentMethods: Record<string, number>;
  orderStatuses: Record<string, number>;
  last30Days: Array<{ date: string; revenue: number; transactions: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  recentTransactions: Array<{
    _id: string;
    type: "sale" | "order";
    total: number;
    itemCount: number;
    paymentMethod: string;
    createdAt: Date;
  }>;
}

const MAX_BAR_HEIGHT = 180;

function MiniBarChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-[2px] h-[180px]">
      {data.map((d, i) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
            {formatPrice(d.revenue)}
            <div className="text-white/50 text-[8px]">{new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</div>
          </div>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.revenue / maxRevenue) * MAX_BAR_HEIGHT}px` }}
            transition={{ duration: 0.6, delay: i * 0.01, ease: "easeOut" }}
            className="w-full rounded-t-sm bg-gradient-to-t from-gold/60 to-gold/30 hover:from-gold hover:to-gold/60 transition-colors cursor-pointer"
          />
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-charcoal via-charcoal-light to-ebony p-8 md:p-10 animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded-lg" />
          <div className="h-4 w-64 bg-white/5 rounded-lg mt-3" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const metricCards = [
    { title: "Total Revenue", value: formatPrice(data.totalRevenue), icon: DollarSign, trend: `${data.revenueTrend > 0 ? "+" : ""}${data.revenueTrend}%`, trendUp: data.revenueTrend >= 0 },
    { title: "Transactions", value: data.totalTransactions, icon: ShoppingBag, trend: "All time", trendUp: true },
    { title: "Products", value: data.totalProducts, icon: TrendingUp, trend: "In catalog", trendUp: true },
    { title: "Active Users", value: data.activeUsers, icon: Users, trend: `${data.totalUsers} total`, trendUp: true },
  ];

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal via-charcoal-light to-ebony p-8 md:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-2.5 bg-gold/15 rounded-xl backdrop-blur shrink-0">
            <BarChart3 className="w-5 h-5 text-gold-light" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-white">Analytics</h1>
            <p className="text-sm text-white/40 mt-1">
              Sales performance, revenue insights, and business intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="relative overflow-hidden bg-white rounded-2xl p-6 md:p-7 border border-mist/40 hover:border-gold/20 transition-all duration-500 hover:shadow-xl hover:shadow-gold/5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/[0.02] rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-gold/5 to-gold/[0.02] rounded-xl border border-gold/5">
                  <card.icon className="w-5 h-5 text-gold-dark" />
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  card.trendUp ? "text-sage bg-sage/10 border border-sage/20" : "text-rosegold bg-rosegold/10 border border-rosegold/20"
                }`}>
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-serif text-charcoal mb-1.5">{card.value}</p>
              <p className="text-xs text-charcoal/40 tracking-wider uppercase font-medium">{card.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="bg-white rounded-2xl p-7 border border-mist/40 hover:border-gold/15 transition-all duration-500 card-shadow"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-gold to-gold/30 rounded-full" />
            <h2 className="text-lg font-serif text-charcoal">30-Day Revenue</h2>
          </div>
          <span className="text-xs text-charcoal/40">
            Total: <span className="text-gold-dark font-medium">{formatPrice(data.last30Days.reduce((s, d) => s + d.revenue, 0))}</span>
          </span>
        </div>
        <MiniBarChart data={data.last30Days} />
        <div className="flex justify-between mt-3 text-[9px] text-charcoal/30">
          <span>{new Date(data.last30Days[0]?.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
          <span>Today</span>
        </div>
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl p-7 border border-mist/40 hover:border-gold/15 transition-all duration-500 card-shadow"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-gold to-gold/30 rounded-full" />
            <h2 className="text-lg font-serif text-charcoal">Top Products</h2>
          </div>
          <div className="space-y-4">
            {data.topProducts.map((product, i) => {
              const maxRevenue = data.topProducts[0]?.revenue || 1;
              const barWidth = (product.revenue / maxRevenue) * 100;
              return (
                <div key={product.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-medium text-charcoal/30 w-4">{i + 1}</span>
                      <span className="text-charcoal/80 truncate max-w-[180px]">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-charcoal/40">{product.quantity} sold</span>
                      <span className="text-xs font-medium text-charcoal w-20 text-right">{formatPrice(product.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-mist/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold"
                    />
                  </div>
                </div>
              );
            })}
            {data.topProducts.length === 0 && (
              <p className="text-sm text-charcoal/40 text-center py-8">No sales data yet</p>
            )}
          </div>
        </motion.div>

        {/* Payment Methods + Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Payment Methods */}
          <div className="bg-white rounded-2xl p-7 border border-mist/40 hover:border-gold/15 transition-all duration-500 card-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-gold to-gold/30 rounded-full" />
              <h2 className="text-lg font-serif text-charcoal">Payment Methods</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(data.paymentMethods).length > 0 ? (
                (() => {
                  const total = Object.values(data.paymentMethods).reduce((s, v) => s + v, 0);
                  const colors = ["from-gold to-gold-light", "from-sage to-sage/80", "from-rosegold to-rosegold/80"];
                  return Object.entries(data.paymentMethods).map(([method, amount], i) => {
                    const pct = total > 0 ? (amount / total) * 100 : 0;
                    return (
                      <div key={method} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize text-charcoal/80">{method}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-charcoal/40">{Math.round(pct)}%</span>
                            <span className="text-xs font-medium text-charcoal">{formatPrice(amount)}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-mist/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                            className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]}`}
                          />
                        </div>
                      </div>
                    );
                  });
                })()
              ) : (
                <p className="text-sm text-charcoal/40 text-center py-8">No payment data yet</p>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl p-7 border border-mist/40 hover:border-gold/15 transition-all duration-500 card-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-gold to-gold/30 rounded-full" />
              <h2 className="text-lg font-serif text-charcoal">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {data.recentTransactions.map((tx, i) => (
                <motion.div
                  key={tx._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between py-2.5 border-b border-mist/20 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${tx.type === "sale" ? "bg-gold" : "bg-sage"}`} />
                    <div>
                      <p className="text-xs font-medium text-charcoal/70 capitalize">{tx.type}</p>
                      <p className="text-[10px] text-charcoal/30">
                        {new Date(tx.createdAt).toLocaleDateString()} · {tx.itemCount} items · {tx.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium">{formatPrice(tx.total)}</span>
                </motion.div>
              ))}
              {data.recentTransactions.length === 0 && (
                <p className="text-sm text-charcoal/40 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
