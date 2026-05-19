"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { Package, Clock, CheckCircle, Truck, X as XIcon, ChevronRight, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  paymentStatus: string;
  paymentReference?: string;
  createdAt: string;
}

const statusIcons: Record<string, typeof Package> = {
  pending: Clock, confirmed: Package, processing: Package, shipped: Truck, delivered: CheckCircle, cancelled: XIcon,
};

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  confirmed: "text-blue-600 bg-blue-50 border-blue-200",
  processing: "text-blue-600 bg-blue-50 border-blue-200",
  shipped: "text-purple-600 bg-purple-50 border-purple-200",
  delivered: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setOrders(data.orders ?? []);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-ivory">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif text-charcoal mb-2">My Orders</h1>
            <p className="text-charcoal/50 text-sm">{orders.length} {orders.length === 1 ? "order" : "orders"}</p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-mist/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-8 h-8 text-charcoal/15" />
              </div>
              <h2 className="text-lg font-serif text-charcoal mb-2">No orders yet</h2>
              <p className="text-charcoal/40 text-sm mb-6">Place your first order to see it here.</p>
              <Link href="/shop" className="inline-block px-6 py-3 bg-ebony text-white rounded-xl text-sm hover:bg-charcoal transition-all">
                Browse Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const Icon = statusIcons[order.status] || Package;
                return (
                  <Link
                    key={order._id}
                    href={`/order/${order.orderNumber}`}
                    className="block bg-white rounded-2xl border border-mist/40 p-5 sm:p-6 hover:border-gold/20 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-charcoal/40 tracking-wider uppercase mb-0.5">Order</p>
                        <p className="text-sm font-mono text-charcoal">{order.orderNumber}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-charcoal/20 group-hover:text-charcoal/40 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border capitalize ${statusColors[order.status] || "text-charcoal/50 bg-mist/50"}`}>
                          <Icon className="w-3 h-3" />
                          {order.status}
                        </span>
                        <span className="text-xs text-charcoal/30">
                          {new Date(order.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-charcoal">{formatPrice(order.total)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-charcoal/30">{order.items.length} {order.items.length === 1 ? "item" : "items"}</p>
                      <span className={`text-[9px] font-medium uppercase tracking-wider ${
                        order.paymentStatus === "paid" ? "text-sage" :
                        order.paymentStatus === "pending" ? "text-amber-500" : "text-charcoal/20"
                      }`}>{order.paymentStatus}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
