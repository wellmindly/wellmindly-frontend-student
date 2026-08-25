import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { fadeInUp } from "../../lib/motion";
import { Button } from "./Button";

/* ============================================================================
   EmptyState
   ----------------------------------------------------------------------------
   An empty screen is a design surface, not an error. Every empty state here
   answers three things:
     1. what would be here
     2. why it's empty right now
     3. the one action that fills it

   "No data" with a sad-face icon does none of those.
   ========================================================================= */

export type EmptyTone = "neutral" | "primary" | "teal" | "coral" | "sage";

const ICON_TONES: Record<EmptyTone, string> = {
  neutral: "bg-ink-100 text-ink-500",
  primary: "bg-plum-100 text-plum-600",
  teal: "bg-teal-100 text-teal-700",
  coral: "bg-coral-100 text-coral-700",
  sage: "bg-sage-100 text-sage-700",
};

export interface EmptyStateProps {
  /** Decorative lucide icon. */
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  /** The single primary action. */
  action?: { label: string; onClick: () => void; icon?: ReactNode };
  /** An optional lower-commitment escape hatch. */
  secondaryAction?: { label: string; onClick: () => void };
  tone?: EmptyTone;
  /** Compact variant for inside a card or a narrow column. */
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tone = "primary",
  size = "md",
  className,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" ? "px-4 py-8" : "px-6 py-14",
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden
          className={cn(
            "mb-5 inline-flex items-center justify-center rounded-3xl",
            size === "sm"
              ? "h-12 w-12 [&>svg]:h-6 [&>svg]:w-6"
              : "h-16 w-16 [&>svg]:h-8 [&>svg]:w-8",
            ICON_TONES[tone],
          )}
        >
          {icon}
        </span>
      )}

      <h3
        className={cn(
          "font-display font-semibold text-ink-900",
          size === "sm" ? "text-base" : "text-xl",
        )}
      >
        {title}
      </h3>

      {description && (
        <p className="measure-tight mt-2 text-sm leading-relaxed text-ink-600">
          {description}
        </p>
      )}

      {children && <div className="mt-5 w-full">{children}</div>}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {action && (
            <Button
              size={size === "sm" ? "sm" : "md"}
              onClick={action.onClick}
              leadingIcon={action.icon}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size={size === "sm" ? "sm" : "md"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------- ErrorState */

export interface ErrorStateProps {
  title?: string;
  /** Plain-language description. Never surface raw exception text here. */
  description?: ReactNode;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

/**
 * Failure state for a surface whose data didn't load. Separate from EmptyState
 * because the user's next move is different: retry, not create.
 */
export function ErrorState({
  title = "We couldn't load this",
  description = "Check your connection and try again. Nothing you've saved is lost.",
  onRetry,
  retrying = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
      <p className="measure-tight mt-2 text-sm text-ink-600">{description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry} loading={retrying}>
          Try again
        </Button>
      )}
    </div>
  );
}
