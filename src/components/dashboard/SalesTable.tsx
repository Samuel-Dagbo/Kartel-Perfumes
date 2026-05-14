"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Eye, ShoppingBag, Calendar, User, CreditCard, Banknote, ArrowLeft,
  Trash2, Download, AlertTriangle, DollarSign, Percent, X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface SaleItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface Sale {
  _id: string;
  saleNumber: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  customerName?: string;
  customerEmail?: string;
  salesPerson: string;
  notes?: string;
  createdAt: string;
}

interface SalesTableProps {
  sales: Sale[];
  onRefresh: () => void;
}

const paymentIcons: Record<string, typeof CreditCard> = {
  cash: Banknote,
  card: CreditCard,
  transfer: ArrowLeft,
};

const paymentColors: Record<string, string> = {
  cash: "text-sage bg-sage/10 border border-sage/20",
  card: "text-blue-600 bg-blue-50 border border-blue-200",
  transfer: "text-purple-600 bg-purple-50 border border-purple-200",
};

export default function SalesTable({ sales, onRefresh }: SalesTableProps) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = sales.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || (
      s.saleNumber.toLowerCase().includes(q) ||
      s.customerName?.toLowerCase().includes(q) ||
      s.salesPerson.toLowerCase().includes(q) ||
      s.items.some((i) => i.name.toLowerCase().includes(q))
    );
    const saleDate = new Date(s.createdAt);
    const matchesFrom = !dateFrom || saleDate >= new Date(dateFrom + "T00:00:00");
    const matchesTo = !dateTo || saleDate <= new Date(dateTo + "T23:59:59");
    return matchesSearch && matchesFrom && matchesTo;
  });

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Sale deleted");
        setDeleteConfirm(null);
        onRefresh();
      } else {
        toast.error("Failed to delete sale");
      }
    } catch {
      toast.error("Failed to delete sale");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
            <input
              type="text"
              placeholder="Search by number, customer, salesperson..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-mist/50 rounded-xl text-sm placeholder:text-charcoal/25 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-3 bg-white border border-mist/50 rounded-xl text-xs text-charcoal/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all"
              title="From date"
            />
            <span className="text-charcoal/20">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-3 bg-white border border-mist/50 rounded-xl text-xs text-charcoal/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all"
              title="To date"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="p-2 hover:bg-mist/50 rounded-lg transition-colors text-charcoal/30 hover:text-charcoal/60"
                aria-label="Clear date filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-charcoal/40 shrink-0">
          <span className="hidden sm:inline">
            {filtered.length} of {sales.length} sale{sales.length !== 1 ? "s" : ""}
          </span>
          <span className="hidden sm:inline text-charcoal/20">|</span>
          <span>
            Total: <span className="text-gold-dark font-medium">
              {formatPrice(filtered.reduce((s, sale) => s + sale.total, 0))}
            </span>
          </span>
        </div>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filtered.map((sale, i) => (
            <motion.div
              key={sale._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.02 }}
              className="group bg-white rounded-2xl border border-mist/40 hover:border-gold/20 transition-all duration-300 card-shadow hover:shadow-lg overflow-hidden"
            >
              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl flex items-center justify-center shrink-0 border border-gold/10">
                      <ShoppingBag className="w-4 h-4 text-gold-dark/60" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-charcoal">{sale.saleNumber}</span>
                        <Badge variant="default" size="sm">
                          {new Date(sale.createdAt).toLocaleDateString("en", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium capitalize ${paymentColors[sale.paymentMethod] || "text-charcoal/40 bg-mist/50"}`}>
                          {sale.paymentMethod}
                        </div>
                        <span className="text-xs text-charcoal/40">
                          {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-serif text-charcoal">{formatPrice(sale.total)}</p>
                    <p className="text-[10px] text-charcoal/30">Subtotal: {formatPrice(sale.subtotal)}</p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {sale.items.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-mist/20 rounded-lg px-3 py-1.5 border border-mist/20">
                      <div className="w-6 h-6 rounded bg-mist/40 overflow-hidden shrink-0">
                        {item.image ? (
                          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-3 h-3 text-charcoal/20" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-charcoal/70 truncate max-w-[100px]">{item.name}</span>
                      <span className="text-[10px] text-charcoal/40">x{item.quantity}</span>
                    </div>
                  ))}
                  {sale.items.length > 5 && (
                    <div className="flex items-center px-3 py-1.5 text-xs text-charcoal/40 bg-mist/10 rounded-lg">
                      +{sale.items.length - 5} more
                    </div>
                  )}
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between border-t border-mist/20 pt-3">
                  <div className="flex items-center gap-4 text-xs text-charcoal/40">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {sale.customerName || "Walk-in"}
                    </div>
                    <div>
                      by <span className="text-charcoal/60 font-medium">{sale.salesPerson}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="p-2 bg-mist/20 hover:bg-mist/40 rounded-xl transition-all border border-transparent hover:border-mist/50"
                      aria-label="View sale details"
                    >
                      <Eye className="w-4 h-4 text-charcoal/40 hover:text-charcoal/60" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(sale._id)}
                      className="p-2 hover:bg-rosegold/10 rounded-xl transition-all"
                      aria-label="Delete sale"
                    >
                      <Trash2 className="w-4 h-4 text-rosegold/60 hover:text-rosegold" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-mist/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-charcoal/20" />
            </div>
            <p className="text-charcoal/40 text-sm font-medium">
              {search ? "No sales match your search" : "No sales recorded yet"}
            </p>
            <p className="text-xs text-charcoal/30 mt-1">
              {search ? "Try a different search term" : "Use the POS terminal to create your first sale"}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => !deleting && setDeleteConfirm(null)} title="Delete Sale" size="sm">
        <div className="text-center space-y-5">
          <div className="w-16 h-16 bg-rosegold/10 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-rosegold" />
          </div>
          <div>
            <p className="text-sm text-charcoal/60">Are you sure you want to delete this sale?</p>
            <p className="text-xs text-charcoal/40 mt-1">This will not restore product stock. This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="danger" size="sm" loading={deleting} onClick={() => handleDelete(deleteConfirm!)}>
              Delete
            </Button>
            <Button variant="ghost" size="sm" disabled={deleting} onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sale Detail Modal */}
      <Modal isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} title={`Sale ${selectedSale?.saleNumber}`} size="lg">
        {selectedSale && (
          <div className="space-y-6">
            {/* Sale info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-mist/30 to-mist/10 rounded-xl p-4 border border-mist/20">
                <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 mb-1 font-medium">Customer</p>
                <p className="text-sm font-medium">{selectedSale.customerName || "Walk-in Customer"}</p>
                {selectedSale.customerEmail && (
                  <p className="text-xs text-charcoal/50 mt-0.5">{selectedSale.customerEmail}</p>
                )}
              </div>
              <div className="bg-gradient-to-br from-mist/30 to-mist/10 rounded-xl p-4 border border-mist/20">
                <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 mb-1 font-medium">Payment</p>
                <p className="text-sm font-medium capitalize">{selectedSale.paymentMethod}</p>
              </div>
              <div className="bg-gradient-to-br from-mist/30 to-mist/10 rounded-xl p-4 border border-mist/20">
                <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 mb-1 font-medium">Sales Person</p>
                <p className="text-sm font-medium">{selectedSale.salesPerson}</p>
              </div>
              <div className="bg-gradient-to-br from-mist/30 to-mist/10 rounded-xl p-4 border border-mist/20">
                <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 mb-1 font-medium">Date</p>
                <p className="text-sm font-medium">
                  {new Date(selectedSale.createdAt).toLocaleDateString("en", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 mb-3 font-medium">Items</p>
              <div className="bg-gradient-to-br from-mist/20 to-mist/5 rounded-xl border border-mist/10 divide-y divide-mist/10">
                {selectedSale.items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-4"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-mist shrink-0 border border-mist/30">
                      {item.image ? (
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-charcoal/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                      <p className="text-xs text-charcoal/40">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gradient-to-br from-gold/[0.03] to-gold/[0.01] rounded-xl p-5 border border-gold/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/60">Subtotal</span>
                <span className="font-medium">{formatPrice(selectedSale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/60">Tax</span>
                <span className="font-medium">{formatPrice(selectedSale.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-serif pt-3 border-t border-gold/10">
                <span className="text-charcoal">Total</span>
                <span className="text-gold-dark">{formatPrice(selectedSale.total)}</span>
              </div>
            </div>

            {selectedSale.notes && (
              <div className="bg-mist/20 rounded-xl p-4">
                <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal/40 mb-1 font-medium">Notes</p>
                <p className="text-sm text-charcoal/70">{selectedSale.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
