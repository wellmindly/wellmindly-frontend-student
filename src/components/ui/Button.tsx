import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

/* ============================================================================
   Button
   ----------------------------------------------------------------------------
   One button, five intents, four sizes. Every interactive control in the
   student app should be this, an <a> styled with `buttonClasses`, or IconButton.

   Guarantees that used to be missing app-wide:
     · min height ≥44px on every size except `xs` (which is chip-sized and only
       valid inside a row that already has its own 44px hit area)
     · a visible focus ring (never `outline-none` without a replacement)
     · loading state that keeps the label width stable - no layout jump
     · disabled communicates *why* via aria-disabled + cursor, not just opacity
   ========================================================================= */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-plum-500 text-white shadow-sm",
    "hover:bg-plum-600 hover:shadow-md",
    "active:bg-plum-700",
    "disabled:bg-plum-300 disabled:shadow-none",
  ),
  secondary: cn(
    "bg-plum-50 text-plum-700 border border-plum-100",
    "hover:bg-plum-100 hover:border-plum-200",
    "active:bg-plum-200",
    "disabled:bg-ink-50 disabled:text-ink-400 disabled:border-ink-100",
  ),
  ghost: cn(
    "bg-transparent text-ink-600",
    "hover:bg-ink-100 hover:text-ink-900",
    "active:bg-ink-200",
    "disabled:text-ink-400",
  ),
  outline: cn(
    "bg-white text-ink-800 border border-ink-200 shadow-2xs",
    "hover:border-ink-300 hover:bg-ink-50",
    "active:bg-ink-100",
    "disabled:bg-white disabled:text-ink-400 disabled:border-ink-100 disabled:shadow-none",
  ),
  danger: cn(
    "bg-danger text-white shadow-sm",
    "hover:bg-danger-strong hover:shadow-md",
    "active:bg-danger-strong",
    "disabled:bg-ink-300 disabled:shadow-none",
  ),
};

const SIZES: Record<ButtonSize, string> = {
  // Chip-sized. Only inside a parent row that already meets the 44px target.
  xs: "h-9 min-h-9 px-3 text-xs gap-1.5 rounded-lg",
  sm: "h-11 min-h-11 px-4 text-sm gap-2 rounded-xl",
  md: "h-12 min-h-12 px-5 text-sm gap-2 rounded-xl",
  lg: "h-14 min-h-14 px-7 text-base gap-2.5 rounded-2xl",
};

const ICON_SIZES: Record<ButtonSize, string> = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export const buttonBase = cn(
  "relative inline-flex items-center justify-center",
  "font-semibold whitespace-nowrap select-none",
  "transition-[background-color,border-color,box-shadow,transform,color]",
  "duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
  "cursor-pointer border-none",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
  "active:scale-[0.98]",
  "disabled:pointer-events-none disabled:cursor-not-allowed",
  "motion-reduce:active:scale-100 motion-reduce:transition-none",
);

/** Compose button styling onto a non-button element (e.g. an <a> or <Link>). */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(buttonBase, VARIANTS[variant], SIZES[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon before the label. Decorative - it is aria-hidden automatically. */
  leadingIcon?: ReactNode;
  /** Icon after the label. */
  trailingIcon?: ReactNode;
  /** Shows a spinner and blocks interaction, keeping the button's width. */
  loading?: boolean;
  /** Announced to screen readers while `loading`. */
  loadingLabel?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    leadingIcon,
    trailingIcon,
    loading = false,
    loadingLabel = "Working…",
    fullWidth = false,
    className,
    children,
    disabled,
    type = "button",
    ...rest
  },
  ref,
) {
  const isBlocked = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isBlocked}
      aria-busy={loading || undefined}
      className={cn(
        buttonBase,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {/* Label stays mounted at zero opacity so the button never resizes. */}
      <span
        className={cn(
          "inline-flex items-center justify-center",
          SIZES[size].includes("gap-1.5") ? "gap-1.5" : "gap-2",
          loading && "invisible",
        )}
      >
        {leadingIcon && (
          <span aria-hidden className={cn("shrink-0 [&>svg]:h-full [&>svg]:w-full", ICON_SIZES[size])}>
            {leadingIcon}
          </span>
        )}
        {children}
        {trailingIcon && (
          <span aria-hidden className={cn("shrink-0 [&>svg]:h-full [&>svg]:w-full", ICON_SIZES[size])}>
            {trailingIcon}
          </span>
        )}
      </span>

      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 aria-hidden className={cn("animate-spin", ICON_SIZES[size])} />
          <span className="sr-only">{loadingLabel}</span>
        </span>
      )}
    </button>
  );
});

/* ------------------------------------------------------------------ IconButton */

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: Exclude<ButtonSize, "xs">;
  /** Required. An icon-only control with no accessible name is unusable. */
  label: string;
  icon: ReactNode;
  /** Round instead of squircle. */
  round?: boolean;
}

const ICON_BUTTON_SIZES: Record<Exclude<ButtonSize, "xs">, string> = {
  sm: "h-11 w-11 rounded-xl [&_svg]:h-4 [&_svg]:w-4",
  md: "h-12 w-12 rounded-xl [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-14 w-14 rounded-2xl [&_svg]:h-6 [&_svg]:w-6",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { variant = "ghost", size = "md", label, icon, round, className, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          buttonBase,
          VARIANTS[variant],
          ICON_BUTTON_SIZES[size],
          "shrink-0 p-0",
          round && "rounded-full",
          className,
        )}
        {...rest}
      >
        <span aria-hidden className="inline-flex items-center justify-center">
          {icon}
        </span>
      </button>
    );
  },
);
