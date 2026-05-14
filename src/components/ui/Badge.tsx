import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "premium";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

const variants: Record<string, string> = {
  default: "bg-mist/60 text-charcoal/60 border border-mist/40",
  success: "bg-sage/10 text-sage border border-sage/20",
  warning: "bg-amber-50 text-amber-600 border border-amber-200",
  danger: "bg-rosegold/10 text-rosegold border border-rosegold/20",
  info: "bg-blue-50 text-blue-600 border border-blue-200",
  premium: "bg-gold/10 text-gold-dark border border-gold/20",
};

const sizes: Record<string, string> = {
  sm: "px-2.5 py-1 text-[10px] tracking-wider rounded-md",
  md: "px-3.5 py-1.5 text-xs tracking-wider rounded-lg",
  lg: "px-4 py-2 text-sm tracking-wider rounded-xl",
};

export default function Badge({ variant = "default", size = "md", children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center font-medium uppercase", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
