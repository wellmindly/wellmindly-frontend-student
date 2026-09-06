import type { ReactNode } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Cross-fade between keyed children, one at a time - a tab panel, a quiz
 * question, a filtered list. Drop-in replacement for
 * `<AnimatePresence mode="wait">`.
 *
 * Why this exists instead of using `AnimatePresence` directly:
 *
 * `mode="wait"` holds the incoming child until the outgoing child's exit
 * animation reports completion. When the OS "reduce motion" setting is on,
 * Framer strips transform animation (`y`, `x`, `scale`) from our exit variants,
 * and the exit then never reports completion - so the incoming child is never
 * mounted, and because `mode="wait"` renders only the child it is waiting on,
 * every later update to that subtree stops reaching the DOM too. Measured on
 * framer-motion 12.40: the dashboard froze on whichever tab loaded first, quiz
 * questions stopped advancing, and the crisis page kept one country's helplines
 * under another country's heading. State and headings outside the wrapper kept
 * updating, which is what made it look like a data bug rather than an
 * animation one.
 *
 * Switching to `mode="sync"` is not the fix: the exiting child still never
 * unmounts, so the stale panel stays on screen underneath the new one.
 *
 * So when the user has asked for reduced motion there is no presence animation
 * to coordinate, and we render the child directly. The keyed child still runs
 * its own `initial`/`animate` opacity fade, which Framer keeps. Users without
 * the setting get the original behaviour unchanged.
 *
 * `useReducedMotion()` reads the media query synchronously on first render and
 * does not live-update, so this does not change shape mid-session and cannot
 * remount the subtree underneath it.
 */
export function PresenceSwap({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return <>{children}</>;

  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
