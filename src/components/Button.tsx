import { forwardRef, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "success" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClass: Record<Variant, string> = {
  primary:
    "bg-violet-500 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-400 disabled:bg-violet-500/60",
  success:
    "bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-400 disabled:bg-green-500/60",
  danger:
    "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-400 disabled:bg-red-500/60",
  ghost:
    "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
  outline:
    "border border-slate-700 bg-slate-900/40 text-slate-200 hover:border-slate-600 hover:bg-slate-800",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...rest}
    />
  );
});
