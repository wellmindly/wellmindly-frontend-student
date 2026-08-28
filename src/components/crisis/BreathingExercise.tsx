import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

// 4-7-8 breathing. `endsAt` is the cumulative cut-point inside one cycle, which is
// what the elapsed-second counter is compared against:
//   second  0..3   Inhale  (4s, ends at 4)
//   second  4..10  Hold    (7s, ends at 11)
//   second 11..18  Exhale  (8s, ends at 19)
const PHASES = [
  { name: "Inhale", seconds: 4, endsAt: 4 },
  { name: "Hold", seconds: 7, endsAt: 11 },
  { name: "Exhale", seconds: 8, endsAt: 19 },
] as const;

const CYCLE_SECONDS = PHASES[PHASES.length - 1].endsAt; // 19

export function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  const cycleSecond = elapsed % CYCLE_SECONDS;
  // `find` always matches because cycleSecond < CYCLE_SECONDS; the fallback only satisfies the type.
  const current = PHASES.find((p) => cycleSecond < p.endsAt) ?? PHASES[0];
  const phase = current.name;
  const remaining = current.endsAt - cycleSecond;

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-plum/10 via-teal/5 to-gold-500/10 border border-plum/20 rounded-3xl p-6 sm:p-8 text-center mb-12 shadow-sm relative overflow-hidden">
      <h2 className="text-2xs font-extrabold uppercase tracking-widest text-plum mb-1">Interactive Grounding Exercise</h2>
      <p className="text-sm font-display font-bold text-ink-800 mb-6">4-7-8 De-escalation Breathing</p>
      
      <div className="relative flex items-center justify-center my-6 h-36">
        <motion.div
          animate={
            shouldReduceMotion
              ? { scale: 1, opacity: active ? 0.9 : 0.6 }
              : {
                  scale: active ? (phase === "Inhale" ? 1.4 : phase === "Hold" ? 1.4 : 1) : 1,
                  opacity: active ? (phase === "Hold" ? 0.9 : 0.75) : 0.6,
                }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : phase === "Inhale" ? 4 : phase === "Exhale" ? 8 : 0.2,
            ease: "easeInOut"
          }}
          className="w-28 h-28 rounded-full bg-plum/20 border-2 border-plum/50 flex items-center justify-center shadow-lg"
        >
          <div className="w-20 h-20 rounded-full bg-plum text-plum-50 flex flex-col items-center justify-center font-bold shadow-md">
            {/* The word and the digits are the sighted channel and are both hidden from
                assistive tech: a live countdown would fire one announcement per second,
                19 per cycle, on a crisis surface. The sr-only region below carries the
                same information, including the duration the digits convey, but changes
                only at a phase boundary — three announcements per cycle. */}
            <span aria-hidden="true" className="text-xs font-semibold">{active ? phase : "Ready"}</span>
            {active && <span aria-hidden="true" className="text-lg font-black">{remaining}s</span>}
            <span aria-live="polite" className="sr-only">
              {active ? `${phase} for ${current.seconds} seconds` : "Ready to begin"}
            </span>
          </div>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (active) {
            setActive(false);
            setElapsed(0);
          } else {
            setActive(true);
            setElapsed(0);
          }
        }}
        className="px-6 py-3 rounded-full bg-plum hover:bg-plum/90 text-plum-50 font-bold text-xs shadow-md transition-all active-press cursor-pointer border-none"
      >
        {active ? "Stop Breathing Exercise" : "Start 4-7-8 Breathing"}
      </button>
    </div>
  );
}
