"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Package, ShoppingCart, DollarSign, TrendingUp, Sparkles,
  RefreshCw, ArrowRight, ShoppingBag, BarChart3,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { seedDatabase } from "@/lib/seed";
import { StatsCardSkeleton } from "@/components/ui/Skeleton";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    revenue: 0,
    todaySales: 0,
    todayRevenue: 0,
    lowStockCount: 0,
  });
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [prodRes, orderRes, salesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/sales"),
      ]);
      const products = await prodRes.json();
      const orders = await orderRes.json();
      const sales = await salesRes.json();

      const productCount = (products.products ?? products ?? []).length;
      const orderCount = (orders.orders ?? orders ?? []).length;
      const saleList = sales.sales ?? sales ?? [];
      const revenue = saleList.reduce((sum: number, s: { total?: number }) => sum + (s.total || 0), 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySales = saleList.filter((s: { createdAt: string | Date }) => new Date(s.createdAt) >= today);
      const todayRevenue = todaySales.reduce((sum: number, s: { total?: number }) => sum + (s.total || 0), 0);
      const productList = products.products ?? products ?? [];
      const lowStockCount = productList.filter((p: { stock: number }) => p.stock > 0 && p.stock <= 5).length;

      setStats({
        totalProducts: productCount,
        totalOrders: orderCount,
        totalSales: saleList.length,
        revenue,
        todaySales: todaySales.length,
        todayRevenue,
        lowStockCount,
      });
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = async () => {
    try {
      const res = await seedDatabase();
      alert(res.message);
      fetchStats();
    } catch (e) {
      alert("Seed failed: " + (e as Error).message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal via-charcoal-light to-ebony p-8 md:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gold/15 rounded-xl backdrop-blur">
                <Sparkles className="w-5 h-5 text-gold-light" />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif text-white">Dashboard</h1>
            </div>
            <p className="text-sm text-white/40 ml-13">
              Overview of your boutique performance
            </p>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSeed}
                icon={<RefreshCw className="w-4 h-4" />}
                className="text-white/50 hover:text-white hover:bg-white/5 border border-white/10"
              >
                Seed Database
              </Button>
            )}
            <Link href="/dashboard/pos">
              <Button variant="gold" size="sm" icon={<TrendingUp className="w-4 h-4" />}>
                POS Terminal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<Package className="w-5 h-5 text-gold-dark" />}
            trend={{ value: 12, positive: true }}
            index={0}
          />
          <StatsCard
            title="Online Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart className="w-5 h-5 text-gold-dark" />}
            trend={{ value: 8, positive: true }}
            index={1}
          />
          <StatsCard
            title="In-Store Sales"
            value={stats.totalSales}
            icon={<TrendingUp className="w-5 h-5 text-gold-dark" />}
            trend={{ value: 5, positive: true }}
            index={2}
          />
          <StatsCard
            title="Total Revenue"
            value={formatPrice(stats.revenue)}
            icon={<DollarSign className="w-5 h-5 text-gold-dark" />}
            subtitle="All time"
            index={3}
          />
        </div>
      )}

      {/* Today's Summary */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-mist/40 p-5 md:p-6 card-shadow"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/5 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gold-dark" />
              </div>
              <div>
                <p className="text-xs text-charcoal/40 tracking-wider uppercase font-medium">Today</p>
                <p className="text-xs text-charcoal/20">
                  {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center divide-x divide-mist/40">
              <div className="px-6 text-center">
                <p className="text-2xl font-serif text-charcoal">{stats.todaySales}</p>
                <p className="text-[10px] text-charcoal/40 tracking-wider uppercase">Sales</p>
              </div>
              <div className="px-6 text-center">
                <p className="text-2xl font-serif text-gold-dark">{formatPrice(stats.todayRevenue)}</p>
                <p className="text-[10px] text-charcoal/40 tracking-wider uppercase">Revenue</p>
              </div>
              <div className="px-6 text-center">
                <p className={`text-2xl font-serif ${stats.lowStockCount > 0 ? "text-rosegold" : "text-sage"}`}>
                  {stats.lowStockCount}
                </p>
                <p className="text-[10px] text-charcoal/40 tracking-wider uppercase">Low Stock</p>
              </div>
            </div>
            <Link href="/dashboard/sales">
              <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                View Sales
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="relative overflow-hidden bg-white rounded-2xl border border-mist/40 hover:border-gold/15 transition-all duration-500 card-shadow group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/[0.02] rounded-full blur-2xl" />
            <div className="relative p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-gold to-gold/30 rounded-full" />
                <h2 className="text-lg font-serif text-charcoal">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { href: "/dashboard/inventory", icon: Package, label: "Manage Inventory", desc: "Products & stock" },
                  { href: "/dashboard/orders", icon: ShoppingBag, label: "View Orders", desc: "Order management" },
                  { href: "/dashboard/pos", icon: BarChart3, label: "POS Terminal", desc: "Point of sale" },
                  ...(isAdmin ? [{ href: null as string | null, icon: RefreshCw, label: "Seed Data", desc: "Populate database", action: handleSeed }] : []),
                ].map((item) => (
                  <div key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="block p-5 bg-mist/20 rounded-xl hover:bg-gold/5 hover:border-gold/20 border border-transparent transition-all duration-300 group/card"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform">
                          <item.icon className="w-5 h-5 text-gold-dark" />
                        </div>
                        <p className="text-sm font-medium text-charcoal/80 group-hover/card:text-charcoal transition-colors">
                          {item.label}
                        </p>
                        <p className="text-xs text-charcoal/40 mt-0.5">{item.desc}</p>
                      </Link>
                    ) : (
                      <button
                        onClick={item.action}
                        className="w-full text-left p-5 bg-gold/[0.03] rounded-xl hover:bg-gold/10 hover:border-gold/20 border border-transparent transition-all duration-300 group/card"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform">
                          <item.icon className="w-5 h-5 text-gold-dark" />
                        </div>
                        <p className="text-sm font-medium text-charcoal/80 group-hover/card:text-charcoal transition-colors">
                          {item.label}
                        </p>
                        <p className="text-xs text-charcoal/40 mt-0.5">{item.desc}</p>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="relative overflow-hidden bg-white rounded-2xl border border-mist/40 hover:border-gold/15 transition-all duration-500 card-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sage/[0.03] rounded-full blur-2xl" />
            <div className="relative p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-gold to-gold/30 rounded-full" />
                <h2 className="text-lg font-serif text-charcoal">Recent Activity</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-mist/30">
                  <span className="text-sm text-charcoal/50">Total transactions</span>
                  <span className="text-3xl font-serif text-charcoal">{stats.totalOrders + stats.totalSales}</span>
                </div>
                {stats.totalOrders > 0 || stats.totalSales > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-mist/30 to-mist/10 rounded-xl p-5 text-center border border-mist/20">
                      <ShoppingCart className="w-5 h-5 text-gold-dark/50 mx-auto mb-2" />
                      <p className="text-xs text-charcoal/40 mb-1">Orders</p>
                      <p className="text-2xl font-serif text-charcoal">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-gradient-to-br from-mist/30 to-mist/10 rounded-xl p-5 text-center border border-mist/20">
                      <TrendingUp className="w-5 h-5 text-gold-dark/50 mx-auto mb-2" />
                      <p className="text-xs text-charcoal/40 mb-1">Sales</p>
                      <p className="text-2xl font-serif text-charcoal">{stats.totalSales}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-mist/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="w-6 h-6 text-charcoal/20" />
                    </div>
                    <p className="text-sm text-charcoal/50">No activity yet. Seed the database or make a sale to get started.</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-charcoal/40">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage/40 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sage" />
                    </span>
                    System operational
                  </div>
                  <span className="text-charcoal/30">
                    {stats.totalProducts} products · {stats.totalOrders} orders · {stats.totalSales} sales
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
