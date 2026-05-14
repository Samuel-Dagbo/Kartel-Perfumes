"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, ChevronDown, ShoppingCart, Calendar, Filter } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string };
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
}

interface OrderTableProps {
  orders: Order[];
  onRefresh: () => void;
}

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info" | "premium"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrderTable({ orders, onRefresh }: OrderTableProps) {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        setSelectedOrder(null);
        onRefresh();
      } else {
        toast.error("Failed to update order");
      }
    } catch {
      toast.error("Failed to update order");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-mist/50 rounded-xl text-sm placeholder:text-charcoal/25 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all shadow-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none w-full sm:w-44 pl-11 pr-10 py-3.5 bg-white border border-mist/50 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all shadow-sm"
          >
            <option value="all">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-mist/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist/40 bg-gradient-to-r from-mist/30 to-mist/10">
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium">Order</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium hidden md:table-cell">Customer</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium">Total</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium hidden sm:table-cell">Status</th>
                <th className="text-left py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium hidden lg:table-cell">Date</th>
                <th className="text-right py-4 px-5 text-[10px] tracking-[0.15em] uppercase text-charcoal/50 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-mist/20 hover:bg-mist/10 transition-colors duration-150"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl flex items-center justify-center shrink-0 border border-gold/10">
                          <ShoppingCart className="w-4 h-4 text-gold-dark/60" />
                        </div>
                        <span className="font-mono text-xs font-medium">{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 hidden md:table-cell">
                      <div>
                        <span className="text-charcoal text-sm font-medium">{order.customer.name}</span>
                        <span className="block text-xs text-charcoal/30 mt-0.5">{order.customer.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-4 px-5 hidden sm:table-cell">
                      <Badge variant={statusColors[order.status] || "default"} size="md">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-charcoal/40 text-xs hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2.5 bg-mist/20 hover:bg-mist/40 rounded-xl transition-all duration-200 border border-transparent hover:border-mist/50"
                        aria-label="View order details"
                      >
                        <Eye className="w-4 h-4 text-charcoal/40 hover:text-charcoal/60" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-mist/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-7 h-7 text-charcoal/20" />
            </div>
            <p className="text-charcoal/40 text-sm">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.orderNumber}`} size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-mist/30 to-mist/10 rounded-xl p-5 border border-mist/20">
                <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 mb-2 font-medium">Customer</p>
                <p className="text-sm font-medium">{selectedOrder.customer.name}</p>
                <p className="text-xs text-charcoal/50 mt-0.5">{selectedOrder.customer.email}</p>
              </div>
              <div className="bg-gradient-to-br from-mist/30 to-mist/10 rounded-xl p-5 border border-mist/20">
                <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 mb-2 font-medium">Payment</p>
                <p className="text-sm font-medium capitalize mb-1">{selectedOrder.paymentMethod}</p>
                <Badge variant={selectedOrder.paymentStatus === "paid" ? "success" : "warning"} size="sm">
                  {selectedOrder.paymentStatus}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 mb-3 font-medium">Items</p>
              <div className="space-y-2 bg-gradient-to-br from-mist/20 to-mist/5 rounded-xl p-4 border border-mist/10">
                {selectedOrder.items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-2.5 border-b border-mist/20 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-charcoal/40">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-mist/40">
              <p className="text-sm font-medium">Total</p>
              <p className="text-2xl font-serif text-gold-dark">{formatPrice(selectedOrder.total)}</p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 mb-3 font-medium">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                    className={`px-4 py-2.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
                      selectedOrder.status === status
                        ? "bg-charcoal text-white border-charcoal shadow-md"
                        : "border-mist/60 text-charcoal/60 hover:border-charcoal/30 hover:bg-mist/30 hover:shadow-sm"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
