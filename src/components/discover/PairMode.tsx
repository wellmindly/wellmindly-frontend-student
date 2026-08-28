import { useId } from "react";
import { motion } from "framer-motion";
import { tween } from "../../lib/motion";
import type { PairOption } from "./types";

interface PairModeProps {
  pair: PairOption[];
  onPick: (v: string) => void;
}

export function PairMode({ pair, onPick }: PairModeProps) {
  const groupId = useId();
  return (
    <div>
      <h2 id={groupId} className="mb-4 text-sm font-semibold text-ink-600">
        Which pulls you more?
      </h2>
      <div role="group" aria-labelledby={groupId} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pair.map((opt) => (
          <motion.button
            key={opt.v}
            type="button"
            onClick={() => onPick(opt.v)}
            className="flex min-h-[120px] cursor-pointer items-center justify-center rounded-2xl border border-line bg-card p-7 text-center font-display text-lg font-semibold text-ink-900 transition-colors hover:border-plum-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={tween.base}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
