"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const rng = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const particles = Array.from({ length: 30 }, (_, i) => ({
  x: `${5 + rng(i * 137) * 90}%`,
  y: `${10 + rng(i * 281) * 75}%`,
  delay: i * 0.3,
  size: 1.5 + rng(i * 73) * 6,
  duration: 5 + rng(i * 199) * 5,
  yOffset: -40 - rng(i * 311) * 40,
  repeatDelay: 0.5 + rng(i * 157) * 2,
}));

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const blur = useTransform(scrollYProgress, [0, 0.5, 1], ["0px", "2px", "4px"]);

  const textVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.3 + i * 0.15, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 80, rotateX: -40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { delay: i * 0.04, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
  };

  const titleText = "The Essence";
  const subtitleText = "of Luxury";

  return (
    <section ref={ref} className="relative h-screen min-h-[680px] max-h-[1080px] overflow-hidden bg-ebony">
      <motion.div style={{ y, scale }} className="absolute inset-0 scale-110">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 z-10" />
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-1000"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1920&q=80')",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 z-10 opacity-30"
        style={{ filter: blur }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gold/5 via-transparent to-gold/5" />
      </motion.div>

      <div className="absolute inset-0 z-10">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-1/4 left-0 w-px h-1/2 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
        <div className="absolute top-1/4 right-0 w-px h-1/2 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
      </div>

      {/* Floating gold orbs */}
      <div className="absolute top-1/4 left-[15%] w-64 h-64 rounded-full bg-gold/3 blur-3xl animate-pulse-glow pointer-events-none z-10" />
      <div className="absolute bottom-1/3 right-[10%] w-48 h-48 rounded-full bg-gold/3 blur-3xl animate-pulse-glow pointer-events-none z-10" style={{ animationDelay: "1s" }} />

      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute z-10 rounded-full pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: "rgba(232,213,160,0.4)",
            boxShadow: "0 0 12px rgba(232,213,160,0.3)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
            y: [0, p.yOffset],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: p.repeatDelay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        style={{ opacity }}
        className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6"
      >
        <motion.div
          custom={0}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 mb-10"
        >
          <span className="w-16 h-px bg-gold-light/30" />
          <span className="text-gold-light/70 tracking-[0.35em] text-xs uppercase font-light">
            Artisan Fragrances
          </span>
          <span className="w-16 h-px bg-gold-light/30" />
        </motion.div>

        <motion.div style={{ y: titleY }} className="perspective-1000">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9rem] font-serif text-white leading-[0.85] mb-10 tracking-tight">
            <span className="flex justify-center gap-2 sm:gap-4 flex-wrap">
              {titleText.split("").map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-block"
                  style={{ textShadow: "0 2px 40px rgba(0,0,0,0.3)" }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </span>
            <br />
            <span className="flex justify-center gap-2 sm:gap-4 flex-wrap">
              {subtitleText.split("").map((char, i) => (
                <motion.span
                  key={i}
                  custom={i + titleText.length}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-block text-gold"
                  style={{ textShadow: "0 2px 40px rgba(184,134,11,0.3)" }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-32 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent origin-center mb-10"
        />

        <motion.p
          custom={1}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="text-white/50 text-sm sm:text-base md:text-lg max-w-lg mb-14 font-light leading-relaxed tracking-wide"
        >
          Discover our curated collection of exceptional fragrances,
          crafted in limited batches for the discerning few.
        </motion.p>

        <motion.div
          custom={2}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-5"
        >
          <motion.a
            href="/shop"
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-4.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white text-xs tracking-[0.25em] uppercase font-medium rounded-xl hover:shadow-2xl hover:shadow-gold/25 transition-all duration-500 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">Discover Collection</span>
          </motion.a>
          <motion.a
            href="/#about"
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-4.5 border border-white/20 text-white/80 text-xs tracking-[0.25em] uppercase font-medium rounded-xl hover:border-gold/50 hover:text-gold hover:bg-gold/5 transition-all duration-500"
          >
            Our Story
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[9px] text-white/20 tracking-[0.4em] uppercase">Scroll</span>
          <div className="w-6 h-10 border border-white/15 rounded-full flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1 h-2.5 rounded-full bg-gold"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
