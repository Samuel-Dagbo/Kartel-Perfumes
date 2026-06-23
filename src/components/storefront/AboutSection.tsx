"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Shield, Droplets, Leaf, Quote } from "lucide-react";

const values = [
  { icon: Leaf, title: "Ethically Sourced", desc: "Every ingredient is hand-harvested from sustainable farms across the globe, ensuring purity at every level." },
  { icon: Droplets, title: "Small Batches", desc: "Each batch is limited to ensure unparalleled quality, consistency, and attention to every detail." },
  { icon: Shield, title: "Cruelty Free", desc: "Never tested on animals. Purely crafted with love, respect, and the highest ethical standards." },
  { icon: Sparkles, title: "Artisan Craft", desc: "Collaborations with master perfumers who share our obsession with quality and perfection." },
];

const testimonials = [
  {
    text: "The most exquisite fragrance I've ever worn. Every spray tells a story. I receive compliments everywhere I go.",
    author: "Eleanor V.",
    title: "Loyal Customer",
  },
  {
    text: "Kartel has redefined what perfume means to me. The craftsmanship is evident in every note.",
    author: "Marcus T.",
    title: "Fragrance Collector",
  },
];

const ROTATE_MS = 5500;

export default function AboutSection({ productImages = [] }: { productImages?: string[] }) {
  const [index, setIndex] = useState(0);
  const images = productImages.length > 0
    ? productImages
    : [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&q=80",
      ];

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <section id="about" className="py-24 md:py-32 px-5 sm:px-8 lg:px-10 bg-gradient-to-b from-ivory via-ivory to-mist/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-14 md:gap-24 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative bg-charcoal">
              <AnimatePresence initial={false}>
                {images.map((src, i) =>
                  i === index ? (
                    <motion.div
                      key={src + i}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${src}')` }}
                      initial={{ opacity: 0, scale: 1.08 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        opacity: { duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94] },
                        scale: { duration: ROTATE_MS / 1000, ease: "linear" },
                      }}
                    />
                  ) : null,
                )}
              </AnimatePresence>

              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === index ? "w-6 bg-gold" : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ivory via-transparent to-transparent pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border border-gold/15 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 border border-gold/10 rounded-2xl -z-10" />

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-mist/50 z-10"
            >
              <p className="text-2xl font-serif text-gold">20+</p>
              <p className="text-[10px] text-charcoal/40 tracking-wider uppercase">Signature Scents</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-gold/40" />
              <span className="text-gold tracking-[0.25em] text-xs uppercase font-medium">Our Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-charcoal mb-8 leading-tight">
              Luxury Within
              <br />
              <span className="text-gold">Reach.</span>
            </h2>
            <div className="w-12 h-px bg-gold/30 mb-8" />
            <div className="space-y-5 text-charcoal/50 text-sm md:text-base leading-relaxed">
              <p>
                Kartel Perfumes was founded on a simple belief: everyone deserves
                to experience premium-quality fragrances without paying luxury
                prices. From the very beginning, our mission has been to create
                exceptional perfumes that combine outstanding quality,
                long-lasting performance, and affordability.
              </p>
              <p>
                Every fragrance is carefully crafted to deliver rich, memorable
                scents that inspire confidence and leave a lasting impression. We
                pay close attention to every detail — from the ingredients we use
                to the presentation of each bottle — ensuring that every product
                reflects the high standards our customers expect.
              </p>
              <p>
                Our commitment to quality and value has earned the trust of
                fragrance lovers who want premium experiences at accessible
                prices. We believe that luxury should be enjoyed every day, not
                reserved for special occasions. Among our collection, the 30ml
                Travel Size has become the heart of the Kartel Perfumes brand and
                our most popular product by far. Compact, stylish, and easy to
                carry, it offers the perfect balance of convenience,
                affordability, and long-lasting fragrance, making it a favorite
                choice for customers everywhere.
              </p>
              <p>
                Today, Kartel Perfumes continues to grow with one clear purpose:
                to provide high-quality, affordable fragrances that help people
                express their individuality with confidence and style.
              </p>
              <p className="font-medium text-charcoal/70">
                Kartel Perfumes — Premium Quality. Fairly Priced. Lasting
                Impressions.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-32">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-gold/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gold/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <v.icon className="w-7 h-7 text-gold-dark" />
              </div>
              <h3 className="text-sm font-serif text-charcoal mb-3 tracking-tight">{v.title}</h3>
              <p className="text-xs text-charcoal/40 leading-relaxed max-w-[200px] mx-auto font-light">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className="w-8 h-px bg-gold/40" />
            <span className="text-gold tracking-[0.25em] text-xs uppercase font-medium">Testimonials</span>
            <span className="w-8 h-px bg-gold/40" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-mist/40 hover:border-gold/10 transition-all duration-300"
              >
                <Quote className="w-8 h-8 text-gold/20 mb-4" />
                <p className="text-sm text-charcoal/60 leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-serif text-charcoal">{t.author}</p>
                  <p className="text-xs text-charcoal/40">{t.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
