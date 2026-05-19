"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { CheckCircle, Package, Truck, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{ name: string; price: number; quantity: number; image: string }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentReference?: string;
  paymentGateway?: string;
  customer: { name: string; email: string };
  shippingAddress: { line1: string; city: string; state: string; zip: string };
  createdAt: string;
}

const statusIcons: Record<string, typeof Package> = {
  pending: Clock, confirmed: Package, processing: Package, shipped: Truck, delivered: CheckCircle, cancelled: Clock,
};

const statusLabels: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
};

const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/orders/${params.orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setOrder(data.order);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [params.orderNumber]);

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

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="pt-24 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif mb-4">Order Not Found</h1>
            <Link href="/" className="text-gold text-sm hover:underline">Return Home</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentStep = steps.indexOf(order.status);
  const StatusIcon = statusIcons[order.status] || Package;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-ivory">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-sage" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-charcoal mb-2">Order Confirmed</h1>
            <p className="text-charcoal/50 text-sm">Thank you, {order.customer.name}!</p>
          </div>

          <div className="bg-white rounded-2xl border border-mist/40 p-6 sm:p-8 mb-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-mist/40">
              <div>
                <p className="text-xs text-charcoal/40 tracking-wider uppercase mb-1">Order Number</p>
                <p className="text-lg font-mono text-charcoal">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-charcoal/40 tracking-wider uppercase mb-1">Status</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-sage/10 text-sage capitalize">
                  <StatusIcon className="w-3 h-3" />
                  {statusLabels[order.status]}
                </span>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-mist/40">
              <p className="text-xs text-charcoal/40 tracking-wider uppercase mb-3">Order Progress</p>
              <div className="flex items-center gap-1">
                {steps.map((step, i) => (
                  <div key={step} className="flex-1 flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                      i <= currentStep ? "bg-sage text-white" : "bg-mist/60 text-charcoal/30"
                    }`}>
                      {i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? "bg-sage" : "bg-mist/60"}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {steps.map((step) => (
                  <span key={step} className={`text-[9px] tracking-wider uppercase ${
                    steps.indexOf(step) <= currentStep ? "text-sage" : "text-charcoal/20"
                  }`}>{step}</span>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-6 pb-6 border-b border-mist/40">
              <p className="text-xs text-charcoal/40 tracking-wider uppercase mb-2">Items</p>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 bg-mist rounded-lg overflow-hidden shrink-0">
                      {item.image ? (
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-charcoal/5 to-charcoal/10" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-charcoal">{item.name}</p>
                      <p className="text-xs text-charcoal/40">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6 pb-6 border-b border-mist/40">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/50">Subtotal</span>
                <span className="text-charcoal">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/50">Tax</span>
                <span className="text-charcoal">{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/50">Shipping</span>
                <span className="text-charcoal">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-medium pt-2 border-t border-mist/40">
                <span className="text-charcoal">Total</span>
                <span className="text-charcoal font-serif">{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-charcoal/40 tracking-wider uppercase mb-1">Shipping To</p>
                <p className="text-charcoal">{order.customer.name}</p>
                <p className="text-charcoal/60">{order.shippingAddress.line1}</p>
                <p className="text-charcoal/60">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal/40 tracking-wider uppercase mb-1">Payment</p>
                <p className="text-charcoal capitalize">{order.paymentMethod}</p>
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 capitalize ${
                  order.paymentStatus === "paid" ? "bg-sage/10 text-sage" :
                  order.paymentStatus === "pending" ? "bg-amber-50 text-amber-600" :
                  "bg-mist/50 text-charcoal/40"
                }`}>{order.paymentStatus}</span>
                {order.paymentReference && (
                  <p className="text-[10px] text-charcoal/30 mt-1.5 font-mono">
                    Ref: {order.paymentReference.slice(0, 14)}…
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/orders" className="px-6 py-3 bg-white border border-mist/60 rounded-xl text-sm text-charcoal/70 hover:border-charcoal/20 transition-all">
              View All Orders
            </Link>
            <Link href="/shop" className="px-6 py-3 bg-ebony text-white rounded-xl text-sm hover:bg-charcoal transition-all">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
