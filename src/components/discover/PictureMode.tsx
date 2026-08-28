import { useId } from "react";
import { motion } from "framer-motion";
import { tween } from "../../lib/motion";
import { DiscoverIcon } from "./DiscoverIcon";
import type { PictureOption } from "./types";

interface PictureModeProps {
  options: PictureOption[];
  onPick: (o: PictureOption) => void;
}

export function PictureMode({ options, onPick }: PictureModeProps) {
  const groupId = useId();
  return (
    <div>
      <h2 id={groupId} className="mb-4 text-sm font-semibold text-ink-600">
        Which feels most like right now?
      </h2>
      <div role="group" aria-labelledby={groupId} className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        {options.map((opt) => (
          <motion.button
            key={opt.label}
            type="button"
            onClick={() => onPick(opt)}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={tween.base}
          >
            <span
              className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl shadow-sm"
              style={{ background: `linear-gradient(140deg, ${opt.c1}, ${opt.c2})` }}
            >
              <DiscoverIcon name={opt.ic} className="h-9 w-9 text-on-primary" />
            </span>
            <span className="text-sm font-semibold text-ink-800">{opt.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
