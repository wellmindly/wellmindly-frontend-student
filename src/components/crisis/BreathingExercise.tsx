import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

const CYCLE_SECONDS = 19; // 4 + 7 + 8

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
  let phase: "Inhale" | "Hold" | "Exhale" = "Inhale";
  let remaining = 4 - cycleSecond;
  if (cycleSecond < 4) {
    phase = "Inhale";
    remaining = 4 - cycleSecond;
  } else if (cycleSecond < 11) {
    phase = "Hold";
    remaining = 11 - cycleSecond;
  } else {
    phase = "Exhale";
    remaining = 19 - cycleSecond;
  }

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
            <span aria-live="polite" className="text-xs font-semibold">{active ? phase : "Ready"}</span>
            {active && <span aria-hidden="true" className="text-lg font-black">{remaining}s</span>}
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
