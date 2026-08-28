import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { tween } from "../../lib/motion";

/* ============================================================================
   ProgressBar · ProgressRing · StepDots
   ----------------------------------------------------------------------------
   All three carry a real ARIA progressbar role with now/min/max, plus a text
   equivalent - progress must never be conveyed by fill colour alone.
   ========================================================================= */

export type ProgressTone = "primary" | "teal" | "coral" | "gold" | "sage" | "rose" | "success";

const FILL: Record<ProgressTone, string> = {
  primary: "bg-plum-500",
  teal: "bg-teal-500",
  coral: "bg-coral-500",
  gold: "bg-gold-500",
  sage: "bg-sage-500",
  rose: "bg-rose-500",
  success: "bg-success",
};

const STROKE: Record<ProgressTone, string> = {
  primary: "stroke-plum-500",
  teal: "stroke-teal-500",
  coral: "stroke-coral-500",
  gold: "stroke-gold-500",
  sage: "stroke-sage-500",
  rose: "stroke-rose-500",
  success: "stroke-success",
};

export interface ProgressBarProps {
  /** Current value. */
  value: number;
  max?: number;
  tone?: ProgressTone;
  size?: "xs" | "sm" | "md";
  /** Accessible name, e.g. "Quiz progress". Required for a labelled meter. */
  label: string;
  /** Show "3 of 12" style text next to the bar. */
  valueText?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  tone = "primary",
  size = "sm",
  label,
  valueText,
  className,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {valueText && (
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-ink-600">{label}</span>
          <span className="text-xs font-bold tabular-nums text-ink-800">{valueText}</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={valueText}
        className={cn(
          "w-full overflow-hidden rounded-full bg-ink-100",
          size === "xs" ? "h-1" : size === "sm" ? "h-2" : "h-3",
        )}
      >
        <motion.div
          className={cn("h-full rounded-full", FILL[tone])}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={tween.slow}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- ProgressRing */

export interface ProgressRingProps {
  value: number;
  max?: number;
  /** Outer diameter in px. */
  size?: number;
  thickness?: number;
  tone?: ProgressTone;
  label: string;
  /** Content in the middle - usually a big number. */
  children?: React.ReactNode;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 96,
  thickness = 8,
  tone = "primary",
  label,
  children,
  className,
}: ProgressRingProps) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg
        aria-hidden
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        // Start the arc at 12 o'clock rather than 3 o'clock.
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          className="stroke-ink-100"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className={STROKE[tone]}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={tween.slow}
        />
      </svg>
      {children && (
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- StepDots */

export interface StepDotsProps {
  total: number;
  /** Zero-based index of the current step. */
  current: number;
  label?: string;
  className?: string;
}

/**
 * Compact step indicator for multi-step flows. Dots differ in width as well as
 * colour, so the current step is distinguishable without colour perception.
 */
export function StepDots({ total, current, label = "Progress", className }: StepDotsProps) {
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuetext={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          aria-hidden
          layout
          transition={tween.base}
          className={cn(
            "h-1.5 rounded-full",
            i === current
              ? "w-6 bg-plum-500"
              : i < current
                ? "w-1.5 bg-plum-300"
                : "w-1.5 bg-ink-200",
          )}
        />
      ))}
    </div>
  );
}
