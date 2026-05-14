import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, ReactNode, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, id, rightIcon, onRightIconClick, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-200",
              focused ? "text-gold" : "text-charcoal/60"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            id={id}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            className={cn(
              "w-full px-4 py-3.5 bg-white border rounded-xl text-sm text-charcoal placeholder:text-charcoal/25 transition-all duration-300",
              "focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 focus:shadow-sm focus:shadow-gold/5",
              "hover:border-mist/80",
              focused ? "border-gold/50" : "border-mist",
              !!rightIcon && "pr-10",
              error && "border-rosegold focus:border-rosegold focus:ring-rosegold/20",
              className
            )}
            {...props}
          />
          <div className={cn(
            "absolute bottom-0 left-4 h-0.5 bg-gold transition-all duration-300",
            focused ? "w-[calc(100%-32px)]" : "w-0"
          )} />
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal/60 transition-colors p-1"
            >
              {rightIcon}
            </button>
          )}
        </div>
        {helper && !error && (
          <p className="text-xs text-charcoal/40 mt-1">{helper}</p>
        )}
        {error && <p className="text-xs text-rosegold mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
