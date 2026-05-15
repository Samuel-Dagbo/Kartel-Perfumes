"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore();
  const { data: session } = useSession();
  const [checkingOut, setCheckingOut] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 200;
  const shippingProgress = Math.min((subtotal() / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const customer = session?.user
        ? { name: session.user.name || "", email: session.user.email || "" }
        : { name: "Guest Customer", email: "guest@example.com" };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      toast.success("Order placed successfully!", { duration: 6000 });
      if (data.emailSent) {
        toast(
          "📬 Check your spam folder if you don't see the confirmation in your inbox.",
          { duration: 8000, icon: "📬" }
        );
      }
      useCartStore.getState().clearCart();
      closeCart();
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

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
            onClick={closeCart}
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
                <div className="p-2 bg-gold/5 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-gold-dark" />
                </div>
                <h2 className="text-lg font-serif text-charcoal">Your Bag</h2>
                <span className="text-xs text-charcoal/30 bg-mist/50 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-mist/50 rounded-xl transition-colors duration-200"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-charcoal/40" />
              </button>
            </div>

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
                  {/* Free shipping progress */}
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
                    loading={checkingOut}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Checkout
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
