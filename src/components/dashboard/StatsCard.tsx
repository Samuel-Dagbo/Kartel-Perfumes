"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
  index?: number;
}

export default function StatsCard({ title, value, subtitle, icon, trend, className, index = 0 }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [showValue, setShowValue] = useState(false);
  const isNumeric = typeof value === "number";
  const numericTarget = isNumeric ? (value as number) : 0;

  useEffect(() => {
    if (!isNumeric) { setShowValue(true); return; }
    setShowValue(false);
    setDisplayValue(0);
    const timeout = setTimeout(() => {
      const duration = 1500;
      const steps = 30;
      const increment = numericTarget / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericTarget) {
          setDisplayValue(numericTarget);
          setShowValue(true);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }, 300 + index * 100);
    return () => clearTimeout(timeout);
  }, [numericTarget, isNumeric, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "relative overflow-hidden group bg-white rounded-2xl p-6 md:p-7 border border-mist/40 hover:border-gold/20 transition-all duration-500 hover:shadow-xl hover:shadow-gold/5",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gold/[0.02] rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/[0.04] transition-all duration-500" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-gold/5 to-gold/[0.02] rounded-xl group-hover:from-gold/10 group-hover:to-gold/5 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 border border-gold/5">
            {icon}
          </div>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full",
                trend.positive
                  ? "text-sage bg-sage/10 border border-sage/20"
                  : "text-rosegold bg-rosegold/10 border border-rosegold/20"
              )}
            >
              {trend.positive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
        <motion.h3
          key={displayValue}
          initial={showValue ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-serif text-charcoal mb-1.5"
        >
          {isNumeric ? displayValue.toLocaleString() : value}
        </motion.h3>
        <p className="text-xs text-charcoal/40 tracking-wider uppercase font-medium">{title}</p>
        {subtitle && (
          <p className="text-xs text-charcoal/30 mt-1.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
