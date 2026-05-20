"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Truck, ChevronLeft, CreditCard, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

function loadPaystack(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as { PaystackPop?: unknown }).PaystackPop) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load payment SDK"));
    document.body.appendChild(s);
  });
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const { data: session } = useSession();
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const [customerName, setCustomerName] = useState(session?.user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(session?.user?.email || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZip, setAddressZip] = useState("");

  const FREE_SHIPPING_THRESHOLD = 2000;
  const shippingProgress = Math.min((subtotal() / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const tax = Number((subtotal() * 0.08).toFixed(2));
  const shipping = subtotal() > FREE_SHIPPING_THRESHOLD ? 0 : 15;
  const total = Number((subtotal() + tax + shipping).toFixed(2));

  const resetCheckoutForm = useCallback(() => {
    setCustomerName(session?.user?.name || "");
    setCustomerEmail(session?.user?.email || "");
    setCustomerPhone("");
    setAddressLine1("");
    setAddressCity("");
    setAddressState("");
    setAddressZip("");
    setShowCheckoutForm(false);
  }, [session?.user?.name, session?.user?.email]);

  const handleCheckout = useCallback(async () => {
    if (!showCheckoutForm) {
      if (items.length === 0) return;
      setShowCheckoutForm(true);
      return;
    }

    if (!customerName || !customerEmail || !addressLine1 || !addressCity || !addressState || !addressZip) {
      toast.error("Please fill in all required fields");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey || publicKey === "pk_test_xxxxxxxxxxxxxxxxxxxxx") {
      toast.error("Payment is not configured yet. Set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in .env.local");
      return;
    }

    setCheckingOut(true);

    try {
      const initRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customerEmail, amount: total }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) {
        toast.error(initData.error || "Payment could not be started");
        setCheckingOut(false);
        return;
      }

      await loadPaystack();

      const PaystackPop = (window as unknown as { PaystackPop?: { setup: (config: Record<string, unknown>) => { openIframe: () => void } } }).PaystackPop;
      if (!PaystackPop) {
        toast.error("Payment SDK failed to load");
        setCheckingOut(false);
        return;
      }
      const handler = PaystackPop.setup({
        key: publicKey,
        email: customerEmail,
        amount: Math.round(total * 100),
        currency: "GHS",
        ref: initData.reference,
        channels: ["card", "mobile_money", "bank", "ussd"],
        onClose: () => {
          setCheckingOut(false);
          toast("Payment cancelled. You can try again.", { icon: "🕐" });
        },
        callback: async (response: { reference: string }) => {
          try {
            const orderRes = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items,
                customer: { name: customerName, email: customerEmail, phone: customerPhone || undefined },
                shippingAddress: {
                  line1: addressLine1,
                  city: addressCity,
                  state: addressState,
                  zip: addressZip,
                  country: "GH",
                },
                paymentReference: response.reference,
              }),
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) {
              toast.error(orderData.error || "Order creation failed. Your payment is safe — contact support.");
              setCheckingOut(false);
              return;
            }

            toast.success("Order placed successfully!", { duration: 6000 });
            clearCart();
            closeCart();
            resetCheckoutForm();

            window.location.href = `/order/${orderData.order.orderNumber}`;
          } catch {
            toast.error("Something went wrong after payment. Contact support with your reference.");
            setCheckingOut(false);
          }
        },
      });

      handler.openIframe();
    } catch {
      toast.error("Could not start payment. Please try again.");
      setCheckingOut(false);
    }
  }, [
    showCheckoutForm, items, customerName, customerEmail, customerPhone,
    addressLine1, addressCity, addressState, addressZip, total, clearCart, closeCart,
    resetCheckoutForm,
  ]);

  const payLabel = checkingOut ? "Processing…" : `Pay ${formatPrice(total)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
            onClick={() => { if (showCheckoutForm) return; closeCart(); }}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-ivory z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-mist/60">
              <div className="flex items-center gap-3">
                {showCheckoutForm ? (
                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    disabled={checkingOut}
                    className="p-2 -ml-2 hover:bg-mist/50 rounded-xl transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5 text-charcoal/40" />
                  </button>
                ) : (
                  <div className="p-2 bg-gold/5 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-gold-dark" />
                  </div>
                )}
                <h2 className="text-lg font-serif text-charcoal">
                  {showCheckoutForm ? "Checkout" : "Your Bag"}
                </h2>
                {!showCheckoutForm && (
                  <span className="text-xs text-charcoal/30 bg-mist/50 px-2 py-0.5 rounded-full">{items.length}</span>
                )}
              </div>
              <button
                onClick={() => { closeCart(); resetCheckoutForm(); }}
                disabled={checkingOut}
                className="p-2 hover:bg-mist/50 rounded-xl transition-colors duration-200 disabled:opacity-30"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-charcoal/40" />
              </button>
            </div>

            {showCheckoutForm ? (
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                <div>
                  <h3 className="text-xs tracking-widest uppercase text-charcoal/50 font-medium mb-4">Contact</h3>
                  <div className="space-y-3">
                    <Input label="Full Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Doe" disabled={checkingOut} required />
                    <Input label="Email *" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="john@example.com" disabled={checkingOut} required />
                    <Input label="Phone (optional)" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+233 55 123 4567" disabled={checkingOut} />
                  </div>
                </div>

                <div className="h-px bg-mist/60" />

                <div>
                  <h3 className="text-xs tracking-widest uppercase text-charcoal/50 font-medium mb-4">Shipping Address</h3>
                  <div className="space-y-3">
                    <Input label="Street Address *" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="123 Main St" disabled={checkingOut} required />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="City *" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="Accra" disabled={checkingOut} required />
                      <Input label="Region *" value={addressState} onChange={(e) => setAddressState(e.target.value)} placeholder="Greater Accra" disabled={checkingOut} required />
                    </div>
                    <Input label="ZIP / Postal Code *" value={addressZip} onChange={(e) => setAddressZip(e.target.value)} placeholder="00233" disabled={checkingOut} required />
                  </div>
                </div>

                <div className="h-px bg-mist/60" />

                <div className="space-y-2 bg-mist/30 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/50">Subtotal ({items.length} items)</span>
                    <span className="text-charcoal font-medium">{formatPrice(subtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/50">Tax (8%)</span>
                    <span className="text-charcoal font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/50">Shipping</span>
                    <span className="text-charcoal font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                  </div>
                  <div className="h-px bg-mist/60 my-2" />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-charcoal">Total</span>
                    <span className="text-lg font-serif text-charcoal">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secured by Paystack — card, mobile money, bank &amp; USSD</span>
                </div>
              </div>
            ) : (
              <>
                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                    <div className="w-24 h-24 bg-mist/40 rounded-2xl flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-charcoal/15" />
                    </div>
                    <p className="text-charcoal/40 text-sm font-medium mb-1">Your bag is empty</p>
                    <p className="text-charcoal/25 text-xs max-w-[200px]">Discover our collection and add items you love</p>
                    <Button variant="outline" size="sm" className="mt-8" onClick={closeCart}>
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
                      {items.map((item) => (
                        <motion.div
                          key={item.productId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          layout
                          className="flex gap-4 p-4 rounded-xl hover:bg-mist/30 transition-all duration-300 group border border-transparent hover:border-mist/50"
                        >
                          <div className="w-20 h-24 md:w-24 md:h-28 bg-mist rounded-xl overflow-hidden shrink-0 shadow-sm">
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${item.image || '/placeholder.jpg'})` }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="text-sm font-serif text-charcoal truncate pr-2">{item.name}</h3>
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rosegold/10 rounded-lg"
                                aria-label="Remove item"
                              >
                                <X className="w-3.5 h-3.5 text-charcoal/30 hover:text-rosegold" />
                              </button>
                            </div>
                            <p className="text-[11px] text-charcoal/30 mt-1 tracking-wider uppercase">{item.volume}ml</p>
                            <p className="text-sm font-medium text-charcoal mt-2">{formatPrice(item.price)}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="p-2 rounded-lg hover:bg-mist transition-colors border border-border/50"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <motion.span
                                key={item.quantity}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="text-sm font-medium w-7 text-center"
                              >
                                {item.quantity}
                              </motion.span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="p-2 rounded-lg hover:bg-mist transition-colors border border-border/50"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="border-t border-mist/60 px-6 py-5 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Truck className="w-3.5 h-3.5 text-charcoal/30" />
                          {shippingProgress >= 100 ? (
                            <span className="text-sage font-medium">Free shipping applied!</span>
                          ) : (
                            <span className="text-charcoal/40">
                              {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal())} away from free shipping
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 bg-mist/60 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(shippingProgress, 100)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`h-full rounded-full ${shippingProgress >= 100 ? "bg-sage" : "bg-gold/40"}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-charcoal/50">Subtotal</span>
                        <motion.span
                          key={subtotal()}
                          initial={{ scale: 1.05 }}
                          animate={{ scale: 1 }}
                          className="text-xl font-serif text-charcoal"
                        >
                          {formatPrice(subtotal())}
                        </motion.span>
                      </div>
                      <p className="text-[11px] text-charcoal/30">Shipping and taxes calculated at checkout</p>
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleCheckout}
                        icon={<ArrowRight className="w-4 h-4" />}
                      >
                        Checkout
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

            {showCheckoutForm && (
              <div className="border-t border-mist/60 px-6 py-5">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  loading={checkingOut}
                  icon={!checkingOut ? <CreditCard className="w-4 h-4" /> : undefined}
                >
                  {payLabel}
                </Button>
                <p className="text-[10px] text-charcoal/30 text-center mt-3">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
