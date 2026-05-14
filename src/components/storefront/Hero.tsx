"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const rng = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const particles = Array.from({ length: 20 }, (_, i) => ({
  x: `${5 + rng(i * 137) * 90}%`,
  y: `${10 + rng(i * 281) * 75}%`,
  delay: i * 0.3,
  size: 1.5 + rng(i * 73) * 5,
  duration: 5 + rng(i * 199) * 5,
  yOffset: -30 - rng(i * 311) * 30,
  repeatDelay: 0.5 + rng(i * 157) * 2,
}));

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

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen min-h-[680px] max-h-[1080px] overflow-hidden bg-ebony">
      <div className="hidden lg:block absolute inset-0 z-0">
        <motion.div style={{ y: imageY }} className="absolute inset-0 lg:left-[42%] xl:left-[45%] 2xl:left-[48%]">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ebony/40 to-ebony z-10" />
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1920&q=80')" }}
          />
        </motion.div>
      </div>

      <div className="lg:hidden absolute inset-0 z-0">
        <motion.div style={{ y: imageY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90 z-10" />
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1920&q=80')" }}
          />
        </motion.div>
      </div>

      <div className="absolute top-1/4 left-[15%] w-72 h-72 rounded-full bg-gold/3 blur-3xl animate-pulse-glow pointer-events-none z-10" />
      <div className="absolute bottom-1/4 right-[20%] w-48 h-48 rounded-full bg-gold/3 blur-3xl animate-pulse-glow pointer-events-none z-10" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/3 left-[45%] w-32 h-32 rounded-full bg-gold/2 blur-3xl animate-pulse-glow pointer-events-none z-10" style={{ animationDelay: "3s" }} />

      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent z-20" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent z-20" />

      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute z-10 rounded-full pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: "rgba(232,213,160,0.35)",
            boxShadow: "0 0 10px rgba(232,213,160,0.25)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.5, 0],
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
        className="relative z-20 flex items-center h-full px-6 lg:px-12 xl:px-20 2xl:px-28"
      >
        <div className="w-full lg:w-[55%] xl:w-[52%]">
          <div className="max-w-2xl">
            <motion.div
              custom={0}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4 mb-10"
            >
              <span className="w-12 h-px bg-gold-light/30" />
              <span className="text-gold-light/60 tracking-[0.35em] text-xs uppercase font-light">
                Artisan Fragrances
              </span>
            </motion.div>

            <motion.div style={{ y: contentY }} className="perspective-1000 mb-8">
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-serif text-white leading-[0.85] tracking-tight">
                <span className="flex gap-2 sm:gap-4 flex-wrap">
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
                <span className="flex gap-2 sm:gap-4 flex-wrap">
                  {subtitleText.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      custom={i + titleText.length}
                      variants={letterVariants}
                      initial="hidden"
                      animate="visible"
                      className="inline-block shimmer-text"
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
              className="w-20 h-px bg-gradient-to-r from-gold/60 to-transparent origin-left mb-8"
            />

            <motion.p
              custom={1}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="text-white/45 text-sm sm:text-base md:text-lg max-w-lg mb-12 font-light leading-relaxed tracking-wide"
            >
              Discover our curated collection of exceptional fragrances,
              crafted in limited batches for the discerning few.
            </motion.p>

            <motion.div
              custom={2}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.a
                href="/shop"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="group relative px-10 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-white text-xs tracking-[0.25em] uppercase font-medium rounded-xl overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  Discover Collection
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </motion.a>
              <motion.a
                href="/#about"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 border border-white/15 text-white/70 text-xs tracking-[0.25em] uppercase font-medium rounded-xl hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all duration-500"
              >
                Our Story
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[9px] text-white/15 tracking-[0.4em] uppercase">Scroll</span>
          <div className="w-5 h-8 border border-white/10 rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1 h-2 rounded-full bg-gold"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
