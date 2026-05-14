"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Minus, X, ShoppingBag, CreditCard, Banknote, ArrowLeft, Check,
  Printer, User, Percent,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  volume: number;
  concentration: string;
  images: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface SaleData {
  _id: string;
  saleNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  customerName?: string;
  salesPerson: string;
  createdAt: string;
  cashAmount?: number;
  change?: number;
}

export default function POSInterface() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("card");
  const [customerName, setCustomerName] = useState("");
  const [customerNameError, setCustomerNameError] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashError, setCashError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<SaleData | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products ?? data ?? []);
    } catch {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !showCheckoutModal && !showReceipt) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCheckoutModal, showReceipt]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) && p.stock > 0
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product._id === product._id);
      if (existing) {
        return prev.map((c) =>
          c.product._id === product._id
            ? { ...c, quantity: Math.min(c.quantity + 1, product.stock) }
            : c
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.product._id !== productId) return c;
          const newQty = c.quantity + delta;
          if (newQty <= 0) return null;
          return { ...c, quantity: Math.min(newQty, c.product.stock) };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const change = paymentMethod === "cash" && cashAmount
    ? Math.max(0, parseFloat(cashAmount) - total)
    : 0;

  const openCheckout = () => {
    if (cart.length === 0) return;
    setCustomerNameError("");
    setCashError("");
    setCashAmount("");
    setShowCheckoutModal(true);
  };

  const handleCheckout = async () => {
    const name = customerName.trim();
    if (!name) {
      setCustomerNameError("Customer name is required");
      return;
    }
    if (paymentMethod === "cash") {
      const amt = parseFloat(cashAmount);
      if (!cashAmount || isNaN(amt) || amt < total) {
        setCashError("Amount received must be at least " + formatPrice(total));
        return;
      }
    }
    setCustomerNameError("");
    setCashError("");
    setProcessing(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({
            product: c.product._id,
            name: c.product.name,
            price: c.product.price,
            quantity: c.quantity,
          })),
          subtotal,
          tax,
          total,
          paymentMethod,
          customerName: name,
          salesPerson: "In-Store",
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      const paidAmount = paymentMethod === "cash" ? parseFloat(cashAmount) || total : total;
      setLastSale({
        _id: data._id,
        saleNumber: data.saleNumber,
        items: data.items || cart.map((c) => ({
          name: c.product.name,
          quantity: c.quantity,
          price: c.product.price,
        })),
        subtotal: data.subtotal ?? subtotal,
        tax: data.tax ?? tax,
        total: data.total ?? total,
        paymentMethod: data.paymentMethod ?? paymentMethod,
        customerName: data.customerName ?? name,
        salesPerson: data.salesPerson ?? "In-Store",
        createdAt: data.createdAt ?? new Date().toISOString(),
        cashAmount: paymentMethod === "cash" ? paidAmount : undefined,
        change: paymentMethod === "cash" ? paidAmount - total : 0,
      });
      setShowCheckoutModal(false);
      setShowReceipt(true);
      setCart([]);
      toast.success("Sale completed!");
    } catch {
      toast.error("Sale failed");
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print");
      return;
    }
    if (!lastSale) return;
    const itemsHtml = lastSale.items
      .map(
        (item) => `
        <tr>
          <td style="padding:4px 0;font-size:12px">${item.name} × ${item.quantity}</td>
          <td style="padding:4px 0;font-size:12px;text-align:right">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Receipt ${lastSale.saleNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #000;
          width: 300px;
          margin: 0 auto;
          padding: 20px;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 18px; font-weight: bold; letter-spacing: 2px; }
        .header p { font-size: 10px; color: #666; margin-top: 4px; }
        .divider { border-top: 1px dashed #000; margin: 12px 0; }
        .info { font-size: 11px; margin-bottom: 12px; }
        .info div { margin-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; }
        th { font-size: 10px; text-align: left; padding: 6px 0; border-bottom: 1px solid #000; }
        .totals { margin-top: 12px; }
        .totals div { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
        .totals .grand-total { font-size: 16px; font-weight: bold; border-top: 1px solid #000; padding-top: 6px; margin-top: 6px; }
        .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #666; }
        .gold-line { height: 1px; background: #000; margin: 12px 0; }
        @media print {
          body { width: 80mm; padding: 0; }
        }
      </style>
      </head>
      <body>
        <div class="header">
          <h1>KARTEL</h1>
          <p>Artisan Fragrances</p>
          <p style="font-size:9px;margin-top:8px">${new Date(lastSale.createdAt).toLocaleDateString("en", {
            year: "numeric", month: "long", day: "numeric",
          })} ${new Date(lastSale.createdAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div class="divider"></div>
        <div class="info">
          <div><strong>Receipt:</strong> ${lastSale.saleNumber}</div>
          <div><strong>Customer:</strong> ${lastSale.customerName || "Walk-in"}</div>
          <div><strong>Cashier:</strong> ${lastSale.salesPerson}</div>
          <div><strong>Payment:</strong> ${lastSale.paymentMethod.toUpperCase()}</div>
        </div>
        <div class="divider"></div>
        <table>
          <thead><tr><th>Item</th><th style="text-align:right">Amount</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="divider"></div>
        <div class="totals">
          <div><span>Subtotal</span><span>${formatPrice(lastSale.subtotal)}</span></div>
          <div><span>Tax (8%)</span><span>${formatPrice(lastSale.tax)}</span></div>
          ${lastSale.paymentMethod === "cash" && lastSale.cashAmount ? `
          <div><span>Amount Paid</span><span>${formatPrice(lastSale.cashAmount)}</span></div>
          <div><span>Change</span><span>${formatPrice(lastSale.change || 0)}</span></div>
          ` : ""}
          <div class="grand-total"><span>TOTAL</span><span>${formatPrice(lastSale.total)}</span></div>
        </div>
        <div class="gold-line"></div>
        <div class="footer">
          <p>Thank you for your patronage</p>
          <p style="margin-top:4px">kartel.com</p>
        </div>
        <script>window.print();window.close();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Product Browser */}
      <div className="flex-1">
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
          <input
            ref={searchRef}
            type="text"
            placeholder='Search products... (Press "/" to focus)'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-mist rounded-xl text-sm placeholder:text-charcoal/25 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <motion.button
              key={product._id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => addToCart(product)}
              className="bg-white rounded-2xl border border-mist/40 p-4 text-left hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 group"
            >
              <div className="w-full aspect-square bg-gradient-to-br from-mist to-mist/50 rounded-xl mb-3 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${product.images[0] || '/placeholder.jpg'})` }}
                />
              </div>
              <p className="text-xs font-medium truncate">{product.name}</p>
              <p className="text-xs text-charcoal/40">{product.volume}ml</p>
              <p className="text-sm font-serif mt-1.5 text-gold-dark">{formatPrice(product.price)}</p>
            </motion.button>
          ))}
          {filtered.length === 0 && search && (
            <div className="col-span-full text-center py-12">
              <p className="text-sm text-charcoal/40">No products matching &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-96 bg-white rounded-2xl border border-mist/40 flex flex-col shadow-sm">
        <div className="p-5 border-b border-mist/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/5 rounded-lg">
                <ShoppingBag className="w-4 h-4 text-gold-dark" />
              </div>
              <span className="text-sm font-medium">Current Sale</span>
            </div>
            <span className="text-xs text-charcoal/40 bg-mist/30 px-2.5 py-1 rounded-full">{cart.length} items</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px] max-h-[400px]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-14 h-14 bg-mist/30 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-charcoal/20" />
              </div>
              <p className="text-xs text-charcoal/40">Tap products to add</p>
              <p className="text-[10px] text-charcoal/25 mt-1">or press / to search</p>
            </div>
          ) : (
            <AnimatePresence>
              {cart.map((c) => (
                <motion.div
                  key={c.product._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-mist/20 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{c.product.name}</p>
                    <p className="text-xs text-charcoal/40">{formatPrice(c.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(c.product._id, -1)}
                      className="p-1.5 rounded-lg hover:bg-mist transition-colors border border-mist/40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <motion.span
                      key={c.quantity}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-medium w-6 text-center"
                    >
                      {c.quantity}
                    </motion.span>
                    <button
                      onClick={() => updateQuantity(c.product._id, 1)}
                      className="p-1.5 rounded-lg hover:bg-mist transition-colors border border-mist/40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-medium w-20 text-right">
                    {formatPrice(c.product.price * c.quantity)}
                  </p>
                  <button
                    onClick={() => setCart((prev) => prev.filter((x) => x.product._id !== c.product._id))}
                    className="p-1.5 hover:bg-rosegold/10 rounded-xl transition-colors"
                    aria-label="Remove item"
                  >
                    <X className="w-3.5 h-3.5 text-rosegold/60" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="border-t border-mist/40 p-5 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal/60">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal/60">Tax (8%)</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>
          <div className="flex items-center justify-between text-xl font-serif pt-3 border-t border-mist/40">
            <span>Total</span>
            <motion.span
              key={total}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-gold-dark"
            >
              {formatPrice(total)}
            </motion.span>
          </div>
          <Button
            variant="premium"
            size="lg"
            className="w-full"
            disabled={cart.length === 0}
            onClick={openCheckout}
          >
            Checkout
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal isOpen={showCheckoutModal} onClose={() => !processing && setShowCheckoutModal(false)} title="Complete Sale">
        <div className="space-y-6">
          {/* Customer Name — required */}
          <div>
            <Input
              label="Customer Name *"
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); setCustomerNameError(""); }}
              placeholder="Enter customer name"
              error={customerNameError}
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-charcoal/60 mb-3 font-medium">Payment Method</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "cash" as const, label: "Cash", icon: Banknote },
                { value: "card" as const, label: "Card", icon: CreditCard },
                { value: "transfer" as const, label: "Transfer", icon: ArrowLeft },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-xs transition-all duration-200 ${
                    paymentMethod === method.value
                      ? "border-gold bg-gold/5 text-gold-dark shadow-sm ring-1 ring-gold/20"
                      : "border-mist text-charcoal/60 hover:border-charcoal/20 hover:bg-mist/20"
                  }`}
                >
                  <method.icon className="w-5 h-5" />
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Amount Input */}
          {paymentMethod === "cash" && (
            <div>
              <label className="block text-xs font-medium tracking-[0.15em] uppercase text-charcoal/60 mb-2">
                Amount Received
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-charcoal/40 font-medium">GHS</span>
                <input
                  type="number"
                  step="0.01"
                  min={total}
                  value={cashAmount}
                  onChange={(e) => { setCashAmount(e.target.value); setCashError(""); }}
                  placeholder="0.00"
                  className={`w-full pl-14 pr-4 py-3.5 bg-white border rounded-xl text-sm text-charcoal placeholder:text-charcoal/25 transition-all ${
                    cashError ? "border-rosegold focus:ring-rosegold/20" : "border-mist focus:border-gold focus:ring-2 focus:ring-gold/10"
                  } focus:outline-none`}
                />
              </div>
              {cashError && <p className="text-xs text-rosegold mt-1">{cashError}</p>}
              {cashAmount && parseFloat(cashAmount) >= total && (
                <div className="flex items-center justify-between mt-3 p-3 bg-sage/10 rounded-xl border border-sage/20">
                  <span className="text-xs text-sage font-medium">Change Due</span>
                  <span className="text-lg font-serif text-sage">{formatPrice(change)}</span>
                </div>
              )}
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-mist/20 rounded-xl p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal/60">Items ({cart.reduce((s, c) => s + c.quantity, 0)})</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-charcoal/60">Tax (8%)</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-serif pt-3 border-t border-mist/40">
              <span>Total</span>
              <span className="text-gold-dark">{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            variant="premium"
            size="lg"
            className="w-full"
            onClick={handleCheckout}
            loading={processing}
            icon={<Check className="w-4 h-4" />}
          >
            Complete Sale — {formatPrice(total)}
          </Button>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="Sale Complete" size="lg">
        {lastSale && (
          <div ref={receiptRef}>
            {/* On-screen receipt preview */}
            <div className="max-w-sm mx-auto bg-white border-2 border-dashed border-mist/60 rounded-2xl p-6 mb-6">
              <div className="text-center mb-6">
                <h3 className="font-serif text-xl text-charcoal tracking-wider">KARTEL</h3>
                <p className="text-[10px] text-charcoal/40 tracking-[0.2em] uppercase mt-1">Artisan Fragrances</p>
                <div className="w-12 h-px bg-gold/40 mx-auto mt-4" />
              </div>

              <div className="text-xs text-charcoal/60 space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-charcoal/40">Receipt</span>
                  <span className="font-mono font-medium text-charcoal/80">{lastSale.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/40">Customer</span>
                  <span className="font-medium text-charcoal/80">{lastSale.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/40">Payment</span>
                  <span className="font-medium capitalize text-charcoal/80">{lastSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/40">Date</span>
                  <span className="text-charcoal/80">
                    {new Date(lastSale.createdAt).toLocaleDateString("en", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-mist/40 pt-4 space-y-2">
                {lastSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-charcoal/70">
                      {item.name} <span className="text-charcoal/40">×{item.quantity}</span>
                    </span>
                    <span className="font-medium text-charcoal">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-mist/40 mt-4 pt-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/50">Subtotal</span>
                  <span className="text-charcoal/70">{formatPrice(lastSale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/50">Tax (8%)</span>
                  <span className="text-charcoal/70">{formatPrice(lastSale.tax)}</span>
                </div>
                {lastSale.paymentMethod === "cash" && lastSale.cashAmount && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/50">Amount Paid</span>
                      <span className="text-charcoal/70">{formatPrice(lastSale.cashAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/50">Change</span>
                      <span className="text-sage font-medium">{formatPrice(lastSale.change || 0)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-lg font-serif pt-2 border-t border-mist/30">
                  <span className="text-charcoal">TOTAL</span>
                  <span className="text-gold-dark">{formatPrice(lastSale.total)}</span>
                </div>
              </div>

              <div className="text-center mt-6 text-[10px] text-charcoal/30">
                <p>Thank you for your patronage</p>
                <p className="mt-0.5">kartel.com</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setShowReceipt(false)}>
                New Sale
              </Button>
              <Button
                variant="gold"
                icon={<Printer className="w-4 h-4" />}
                onClick={printReceipt}
              >
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
