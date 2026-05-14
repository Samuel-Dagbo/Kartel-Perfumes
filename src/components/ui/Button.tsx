"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, useState } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold" | "premium";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, icon, onClick, ...props }, ref) => {
    const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTimeout(() => setRipple(null), 600);
      onClick?.(e);
    };

    const baseStyles = "inline-flex items-center justify-center gap-2.5 font-medium uppercase transition-all duration-400 disabled:opacity-40 disabled:cursor-not-allowed select-none relative overflow-hidden";

    const variants: Record<string, string> = {
      primary:
        "bg-charcoal text-white hover:bg-charcoal-light border border-transparent shadow-md hover:shadow-lg active:scale-[0.98]",
      secondary:
        "bg-gold text-white hover:bg-gold-dark border border-transparent shadow-md hover:shadow-gold/20 active:scale-[0.98]",
      gold:
        "bg-gold text-white hover:bg-gold-dark border border-gold/30 shadow-md hover:shadow-gold/30 active:scale-[0.98]",
      premium:
        "bg-gold text-white border border-gold/40 shadow-lg shadow-gold/10 hover:shadow-xl hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98]",
      outline:
        "bg-transparent text-charcoal border border-border hover:border-gold hover:text-gold hover:bg-gold/[0.03] active:scale-[0.98]",
      ghost:
        "bg-transparent text-charcoal/60 hover:text-charcoal hover:bg-mist/50 active:scale-[0.98]",
      danger:
        "bg-rosegold text-white hover:bg-rosegold/90 border border-transparent shadow-sm active:scale-[0.98]",
    };

    const sizes: Record<string, string> = {
      sm: "px-5 py-2.5 text-[11px] tracking-[0.15em] rounded-lg",
      md: "px-7 py-3 text-xs tracking-[0.2em] rounded-xl",
      lg: "px-9 py-4 text-sm tracking-[0.2em] rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          "before:absolute before:inset-0 before:bg-white/0 before:transition-colors before:duration-300 hover:before:bg-white/[0.03]",
          variants[variant],
          sizes[size],
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {icon && !loading && <span className="shrink-0">{icon}</span>}
        {children}
        {ripple && (
          <span
            className="absolute bg-white/20 rounded-full pointer-events-none animate-ripple"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
