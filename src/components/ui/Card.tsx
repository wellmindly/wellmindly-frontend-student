import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/cn";
import { tween } from "../../lib/motion";

/* ============================================================================
   Card / Surface primitives
   ----------------------------------------------------------------------------
   Elevation encodes hierarchy, not decoration:
     flat    → inline grouping, no lift (inside another card)
     raised  → the default content card
     floating→ the one thing on screen you're meant to act on
     sunken  → an inset well (previews, quoted content, code-like blocks)
   ========================================================================= */

export type CardTone =
  | "default"
  | "primary"
  | "teal"
  | "coral"
  | "gold"
  | "sage"
  | "rose";

export type CardElevation = "flat" | "raised" | "floating" | "sunken";

const TONES: Record<CardTone, string> = {
  default: "bg-white border-ink-200/70",
  primary: "bg-plum-50 border-plum-200/60",
  teal: "bg-teal-50 border-teal-200/60",
  coral: "bg-coral-50 border-coral-200/60",
  gold: "bg-gold-50 border-gold-200/60",
  sage: "bg-sage-50 border-sage-200/60",
  rose: "bg-rose-50 border-rose-200/60",
};

const ELEVATIONS: Record<CardElevation, string> = {
  flat: "shadow-none",
  raised: "shadow-xs",
  floating: "shadow-lg",
  sunken: "shadow-none bg-ink-50/70 border-ink-200/50",
};

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
} as const;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  elevation?: CardElevation;
  padding?: keyof typeof PADDING;
  /** Adds hover lift + pointer cursor. Use with `as="button"` or an onClick. */
  interactive?: boolean;
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    tone = "default",
    elevation = "raised",
    padding = "md",
    interactive = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl border",
        TONES[tone],
        ELEVATIONS[elevation],
        PADDING[padding],
        interactive && "bento-card cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

/* -------------------------------------------------------------- ActionCard */

export interface ActionCardProps extends Omit<HTMLMotionProps<"button">, "children"> {
  tone?: CardTone;
  elevation?: CardElevation;
  padding?: keyof typeof PADDING;
  children?: ReactNode;
}

/**
 * A card that IS the control. Renders a real <button>, so it's keyboard
 * reachable, announced as a button, and Enter/Space work - unlike a div with
 * an onClick, which the old dashboard used in a dozen places.
 */
export const ActionCard = forwardRef<HTMLButtonElement, ActionCardProps>(
  function ActionCard(
    { tone = "default", elevation = "raised", padding = "md", className, children, ...rest },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        type="button"
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.99 }}
        transition={tween.base}
        className={cn(
          "relative block w-full rounded-2xl border text-left",
          "cursor-pointer",
          "transition-shadow duration-200",
          "hover:shadow-lg",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
          "disabled:pointer-events-none disabled:opacity-60",
          TONES[tone],
          ELEVATIONS[elevation],
          PADDING[padding],
          className,
        )}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);

/* ------------------------------------------------------------ Section header */

export interface SectionHeaderProps {
  /** Small uppercase kicker above the title. Optional. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned control (a "See all" link, a filter, a count). */
  action?: ReactNode;
  /** Heading level - pick the one that's correct for the page outline. */
  as?: "h1" | "h2" | "h3";
  className?: string;
  align?: "left" | "center";
}

const HEADING_SIZE = {
  h1: "text-3xl sm:text-4xl",
  h2: "text-2xl sm:text-3xl",
  h3: "text-xl sm:text-2xl",
} as const;

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  as: Heading = "h2",
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex gap-4",
        align === "center"
          ? "flex-col items-center text-center"
          : "flex-col sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("min-w-0", align === "center" && "measure-wide")}>
        {eyebrow && (
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-plum-600">
            {eyebrow}
          </span>
        )}
        <Heading className={cn("font-display font-semibold text-ink-900", HEADING_SIZE[Heading])}>
          {title}
        </Heading>
        {description && (
          <p className={cn("mt-2 text-sm text-ink-600 measure", align === "center" && "mx-auto")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
