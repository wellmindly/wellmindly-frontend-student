import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/* ============================================================================
   Skeleton
   ----------------------------------------------------------------------------
   Loading placeholders that reserve the *real* final dimensions. The app
   previously showed centred spinners, which collapse the layout and then shove
   it back - the single biggest source of layout shift here.

   Skeletons are aria-hidden; the surrounding container should carry
   aria-busy="true" so assistive tech hears "busy", not a wall of empty boxes.
   ========================================================================= */

export interface SkeletonProps {
  className?: string;
  /** Render as a circle (avatars). */
  circle?: boolean;
}

export function Skeleton({ className, circle = false }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "skeleton block",
        circle ? "rounded-full" : "rounded-lg",
        className,
      )}
    />
  );
}

/** A block of fake text lines. The last line is short, like real text. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </span>
  );
}

/** Card-shaped placeholder matching the default `Card` padding and radius. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-2xl border border-ink-200/70 bg-card p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton circle className="h-12 w-12" />
        <div className="flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} className="mt-5" />
    </div>
  );
}

/**
 * Wrapper that swaps a skeleton for content and sets aria-busy in one place, so
 * every loading surface behaves identically.
 */
export function Loadable({
  loading,
  skeleton,
  children,
  className,
}: {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div aria-busy={loading || undefined} className={className}>
      {loading ? skeleton : children}
    </div>
  );
}
