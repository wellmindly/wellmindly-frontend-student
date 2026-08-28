import type { Transition, Variants } from "framer-motion";

/* ============================================================================
   Motion vocabulary
   ----------------------------------------------------------------------------
   Every animation in the student app comes from here, so timing and easing mean
   the same thing everywhere: enter is generous, exit is ~65% of enter, and
   nothing moves for longer than it takes to read.

   Reduced motion is handled globally by <MotionConfig reducedMotion> in App.tsx
   - it strips transform/layout animation and keeps opacity, so these presets are
   safe to use as-is. Use `useReducedMotion()` only for effects Framer can't
   neutralise on its own (autoplay, looping, parallax).
   ========================================================================= */

export const duration = {
  instant: 0.08,
  fast: 0.14,
  base: 0.22,
  slow: 0.34,
  slower: 0.52,
} as const;

/** Matches the CSS `--ease-*` tokens in index.css. */
export const ease = {
  outSoft: [0.16, 1, 0.3, 1],
  outQuint: [0.22, 1, 0.36, 1],
  inOutSoft: [0.4, 0, 0.2, 1],
} as const;

/** Springs, for anything the user directly manipulated. */
export const spring = {
  /** Default for layoutId pills, toggles, tab indicators. */
  snappy: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 },
  /** Sheets, drawers, cards settling into place. */
  soft: { type: "spring", stiffness: 260, damping: 26 },
  /** Slight overshoot - celebrations and reveals only. */
  bouncy: { type: "spring", stiffness: 320, damping: 18 },
} satisfies Record<string, Transition>;

export const tween = {
  fast: { duration: duration.fast, ease: ease.outSoft },
  base: { duration: duration.base, ease: ease.outSoft },
  slow: { duration: duration.slow, ease: ease.outQuint },
} satisfies Record<string, Transition>;

/* ------------------------------------------------------------------ Entrances */

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: tween.slow },
  exit: { opacity: 0, y: -8, transition: tween.fast },
};

/** Alias for fadeInUp. */
export const fadeUp = fadeInUp;

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: tween.base },
  exit: { opacity: 0, scale: 0.97, transition: tween.fast },
};

/* -------------------------------------------------------------------- Stagger */

/**
 * Parent wrapper for staggered lists. 50ms is the sweet spot: perceptible
 * sequence without making the last item feel late.
 */
export function staggerParent(stagger = 0.05, delay = 0): Variants {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
    exit: { opacity: 0, transition: { staggerChildren: 0.02, staggerDirection: -1 } },
  };
}

/** Child of `staggerParent`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: tween.slow },
  exit: { opacity: 0, y: -6, transition: tween.fast },
};

/* ------------------------------------------------------ Overlays & tab routes */

/** Scrim behind sheets/dialogs. */
export const scrim: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
};

/** Centred dialog. */
export const dialogPanel: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring.soft },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: tween.fast },
};

/** Bottom sheet - the mobile counterpart of a dialog. */
export const bottomSheet: Variants = {
  hidden: { y: "100%" },
  show: { y: 0, transition: spring.soft },
  exit: { y: "100%", transition: { duration: duration.base, ease: ease.outSoft } },
};

/** Off-canvas drawer (left edge). */
export const drawer: Variants = {
  hidden: { x: "-100%" },
  show: { x: 0, transition: spring.soft },
  exit: { x: "-100%", transition: { duration: duration.base, ease: ease.outSoft } },
};

/** Toasts rise from the bottom and leave downward, faster. */
export const toast: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring.soft },
  exit: { opacity: 0, y: 16, scale: 0.98, transition: tween.fast },
};

