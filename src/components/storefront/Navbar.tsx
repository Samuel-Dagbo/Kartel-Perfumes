"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, ShoppingBag, User, LogIn, ChevronsRight, Search, Sparkles,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { openCart, itemCount } = useCartStore();
  const { data: session } = useSession();

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div className="bg-transparent backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-20 md:h-24">
            <button
              className="md:hidden p-2 -ml-2 rounded-xl transition-colors hover:bg-white/10 active:bg-white/20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-white/80" />
              ) : (
                <Menu className="w-5 h-5 text-white/80" />
              )}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="text-xl md:text-2xl font-serif tracking-[0.08em] text-white" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
                <span className="text-gradient-gold">KARTEL</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-12">
              {["Shop", "About"].map((item) => (
                <Link
                  key={item}
                  href={item === "Shop" ? "/shop" : "/#about"}
                  className="relative text-xs tracking-[0.2em] uppercase text-white/70 hover:text-white transition-colors duration-300 group"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
              ))}
              {session && (
                <Link
                  href="/dashboard"
                  className="text-xs tracking-[0.2em] uppercase text-white/70 hover:text-white transition-colors duration-300"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}
                >
                  Dashboard
                </Link>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-white/70" />
              </button>

              {session ? (
                <div className="relative group">
                  <button
                    className="p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10"
                    aria-label="Account"
                  >
                    <User className="w-4 h-4 text-white/70" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-mist/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-3 overflow-hidden origin-top-right">
                    <div className="px-5 py-3 border-b border-mist/50 mb-2">
                      <p className="text-sm font-medium text-charcoal truncate">{session.user?.name}</p>
                      <p className="text-xs text-charcoal/40 truncate mt-1">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-5 py-3 text-sm text-charcoal/60 hover:text-charcoal hover:bg-mist/40 transition-all duration-200"
                    >
                      <ChevronsRight className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-rosegold/70 hover:text-rosegold hover:bg-rosegold/5 transition-all duration-200"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className="flex items-center gap-2 p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10"
                  aria-label="Sign in"
                >
                  <LogIn className="w-4 h-4 text-white/70" />
                  <span className="hidden sm:inline text-xs tracking-[0.2em] uppercase text-white/70">Sign In</span>
                </Link>
              )}

              <button
                onClick={openCart}
                className="relative p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-4 h-4 text-white/70" />
                {itemCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-gold text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-gold/20"
                  >
                    {itemCount()}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10"
            >
              <div className="max-w-3xl mx-auto px-5 py-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fragrances..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/40 transition-all"
                  />
                  <button
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white/30" />
                  </button>
                </div>
                {searchQuery && (
                  <div className="mt-3 text-xs text-white/40 text-center">
                    Press Enter to search or browse{" "}
                    <Link href="/shop" className="text-gold-light hover:underline" onClick={() => setSearchOpen(false)}>
                      all fragrances
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-ebony/95 backdrop-blur-2xl border-b border-white/10 shadow-xl"
          >
            <div className="px-5 py-5 space-y-1">
              <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-3.5 text-sm tracking-[0.2em] uppercase text-white/60 hover:text-white border-b border-white/10 hover:pl-2 transition-all duration-200">
                <Sparkles className="w-4 h-4 text-gold/40" /> Shop
              </Link>
              <Link href="/#about" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-3.5 text-sm tracking-[0.2em] uppercase text-white/60 hover:text-white border-b border-white/10 hover:pl-2 transition-all duration-200">
                <User className="w-4 h-4 text-white/30" /> About
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-3.5 text-sm tracking-[0.2em] uppercase text-white/60 hover:text-white border-b border-white/10 hover:pl-2 transition-all duration-200">
                    <ChevronsRight className="w-4 h-4 text-gold/40" /> Dashboard
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 w-full text-left py-3.5 text-sm tracking-[0.2em] uppercase text-rosegold/70 hover:text-rosegold hover:pl-2 transition-all duration-200">
                    <LogIn className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/sign-in" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-3.5 text-sm tracking-[0.2em] uppercase text-white/60 hover:text-white hover:pl-2 transition-all duration-200">
                  <LogIn className="w-4 h-4 text-white/30" /> Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
