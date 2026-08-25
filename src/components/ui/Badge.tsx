import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

/* ============================================================================
   Badge · Chip · Avatar · Divider
   ----------------------------------------------------------------------------
   The old UI expressed status with ~30 one-off pill styles at 9–11px. These are
   the only three shapes we use, and none of them drops below 12px.
   ========================================================================= */

export type BadgeTone =
  | "neutral"
  | "primary"
  | "teal"
  | "coral"
  | "gold"
  | "sage"
  | "rose"
  | "success"
  | "warning"
  | "danger";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-ink-100 text-ink-700 border-ink-200/70",
  primary: "bg-plum-50 text-plum-700 border-plum-200/70",
  teal: "bg-teal-50 text-teal-800 border-teal-200/70",
  coral: "bg-coral-50 text-coral-700 border-coral-200/70",
  gold: "bg-gold-50 text-gold-800 border-gold-200/70",
  sage: "bg-sage-50 text-sage-700 border-sage-200/70",
  rose: "bg-rose-50 text-rose-700 border-rose-200/70",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/20",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Small leading icon. Decorative. */
  icon?: ReactNode;
  /** Pulsing dot for genuinely live state (active session, live room). */
  live?: boolean;
  size?: "sm" | "md";
}

export function Badge({
  tone = "neutral",
  icon,
  live = false,
  size = "sm",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-2xs" : "px-3 py-1.5 text-xs",
        BADGE_TONES[tone],
        className,
      )}
      {...rest}
    >
      {live && (
        <span aria-hidden className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {icon && (
        <span aria-hidden className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- Chip */

export interface ChipProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onSelect"> {
  selected?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  /** Renders as a real toggle for assistive tech. */
  role?: "radio" | "checkbox" | "tab";
}

/**
 * A selectable filter/tag. Always ≥44px tall so it's a legal touch target on
 * its own - the old category pills were 32px.
 */
export function Chip({
  selected = false,
  icon,
  className,
  children,
  disabled,
  role,
  ...rest
}: ChipProps) {
  const ariaState =
    role === "tab"
      ? { "aria-selected": selected }
      : role
        ? { "aria-checked": selected }
        : { "aria-pressed": selected };

  return (
    <button
      type="button"
      role={role}
      disabled={disabled}
      {...ariaState}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold",
        "cursor-pointer transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
        "active-press disabled:pointer-events-none disabled:opacity-50",
        selected
          ? "border-plum-500 bg-plum-500 text-plum-50 shadow-sm"
          : "border-ink-200 bg-card text-ink-600 hover:border-ink-300 hover:text-ink-900",
        className,
      )}
      {...rest}
    >
      {icon && (
        <span aria-hidden className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------- Avatar */

export interface AvatarProps {
  /** Photo URL. Falls back to initials when absent or on load error. */
  src?: string | null;
  /** Used for alt text and initials. */
  name: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Ring colour, e.g. to mark an active coach. */
  ring?: boolean;
  className?: string;
}

const AVATAR_SIZES = {
  xs: "h-8 w-8 text-2xs",
  sm: "h-10 w-10 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
} as const;

export function Avatar({
  src,
  name,
  initials,
  size = "md",
  ring = false,
  className,
}: AvatarProps) {
  const fallback =
    initials ??
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        "rounded-2xl bg-plum-100 font-display font-bold text-plum-700 select-none",
        ring && "ring-2 ring-plum-300 ring-offset-2 ring-offset-card",
        AVATAR_SIZES[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={(e) => {
            // Reveal the initials underneath rather than showing a broken image.
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      {/* Initials sit behind the image, so an error simply uncovers them. */}
      <span aria-hidden className={cn("absolute inset-0 flex items-center justify-center", src && "-z-10")}>
        {fallback || "?"}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------- Divider */

export function Divider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (!label) {
    return <hr className={cn("border-0 border-t border-ink-200/70", className)} />;
  }
  return (
    <div className={cn("flex items-center gap-3", className)} role="separator">
      <span className="h-px flex-1 bg-ink-200/70" />
      <span className="text-2xs font-bold uppercase tracking-[0.14em] text-ink-400">
        {label}
      </span>
      <span className="h-px flex-1 bg-ink-200/70" />
    </div>
  );
}
