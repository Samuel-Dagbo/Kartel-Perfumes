"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Store,
  Sparkles,
  Users,
  BarChart3,
  Receipt,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/sales", label: "Sales", icon: Receipt },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/pos", label: "POS Terminal", icon: Store },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-ebony text-cream rounded-xl shadow-lg hover:bg-charcoal-light transition-all duration-200"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-ebony via-ebony to-charcoal text-white flex flex-col transition-all duration-400 ease-out shadow-2xl shadow-black/20",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/5">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-1.5 bg-gold/10 rounded-lg group-hover:bg-gold/20 transition-colors">
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
              <div>
                <span className="text-base font-serif tracking-[0.15em] block leading-tight">KARTEL</span>
                <span className="text-[9px] text-white/30 tracking-[0.2em] uppercase">Administration</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto group">
              <div className="p-2 bg-gold/10 rounded-xl group-hover:bg-gold/20 transition-colors">
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
            </Link>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors hidden lg:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              className={cn("w-4 h-4 transition-transform duration-300", !collapsed && "rotate-180")}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 group relative",
                  isActive
                    ? "bg-gold/15 text-gold-light shadow-sm shadow-gold/5"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gold rounded-r-full"
                  />
                )}
                <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive && "text-gold")} />
                {!collapsed && (
                  <span className="tracking-wide">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all w-full group",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:text-rosegold transition-colors" />
            {!collapsed && <span className="tracking-wide">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Spacer - only visible on lg+ when sidebar is fixed */}
      <div className={cn("hidden lg:block shrink-0 transition-all duration-400", collapsed ? "w-20" : "w-64")} />
    </>
  );
}
