"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ebony text-white/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Newsletter */}
        <div className="py-16 md:py-20 border-b border-white/5">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-white font-serif text-2xl mb-3 tracking-tight">Join Our Atelier</h3>
            <p className="text-white/30 text-sm mb-8 font-light">
              Receive exclusive access to limited drops, artisan stories, and fragrance insights.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-gold/30 focus:bg-white/[0.07] transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-gold/90 text-white text-xs tracking-[0.2em] uppercase font-medium rounded-xl hover:bg-gold transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Links */}
        <div className="py-20 md:py-28">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-white font-serif text-xl tracking-wide mb-6">
                Maison Noire
              </h3>
              <p className="text-xs leading-relaxed text-white/30 max-w-xs font-light">
                Artisan perfumery dedicated to the craft of exceptional fragrance.
                Every bottle tells a story of passion, patience, and artistry.
              </p>
            </div>

            <div>
              <h4 className="text-white/60 text-xs tracking-[0.2em] uppercase mb-6 font-medium">
                Collections
              </h4>
              <ul className="space-y-4">
                <li><Link href="/shop" className="text-xs text-white/40 hover:text-gold transition-colors duration-200">Eau de Parfum</Link></li>
                <li><Link href="/shop" className="text-xs text-white/40 hover:text-gold transition-colors duration-200">Extrait de Parfum</Link></li>
                <li><Link href="/shop" className="text-xs text-white/40 hover:text-gold transition-colors duration-200">Discovery Set</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white/60 text-xs tracking-[0.2em] uppercase mb-6 font-medium">
                Company
              </h4>
              <ul className="space-y-4">
                <li><Link href="/#about" className="text-xs text-white/40 hover:text-gold transition-colors duration-200">About Us</Link></li>
                <li><Link href="/#about" className="text-xs text-white/40 hover:text-gold transition-colors duration-200">Craftsmanship</Link></li>
                <li><Link href="/#about" className="text-xs text-white/40 hover:text-gold transition-colors duration-200">Sustainability</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white/60 text-xs tracking-[0.2em] uppercase mb-6 font-medium">
                Support
              </h4>
              <ul className="space-y-4">
                <li><Link href="/#about" className="text-xs text-white/40 hover:text-gold transition-colors duration-200">Contact</Link></li>
                <li><Link href="/#about" className="text-xs text-white/40 hover:text-gold transition-colors duration-200">Shipping</Link></li>
                <li><Link href="/#about" className="text-xs text-white/40 hover:text-gold transition-colors duration-200">Returns</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="gold-line" />

        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Maison Noire. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/25 hover:text-white/40 transition-colors duration-200 cursor-pointer">Instagram</span>
            <span className="text-xs text-white/25 hover:text-white/40 transition-colors duration-200 cursor-pointer">Facebook</span>
            <span className="text-xs text-white/25 hover:text-white/40 transition-colors duration-200 cursor-pointer">Pinterest</span>
            <span className="text-xs text-white/25 hover:text-white/40 transition-colors duration-200 cursor-pointer">Twitter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
